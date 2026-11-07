import assert from "node:assert/strict";
import { MongoClient } from "mongodb";

const frontend = process.env.TEST_FRONTEND_URL || "http://localhost:3000";
const backend = process.env.TEST_BACKEND_URL || "http://127.0.0.1:5000";
const client = new MongoClient(process.env.MONGODB_URI);
const email = "ci-user-" + process.pid + "@example.test";
const password = "TestingPassword1234!";

async function waitUntilReady(url, max = 90) {
  for (let attempt = 0; attempt < max; attempt++) {
    try { const res = await fetch(url); if (res.ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  throw new Error("Service not ready: " + url);
}
async function jsonRequest(path, { method = "GET", data, cookie } = {}) {
  const response = await fetch(frontend + path, {
    method,
    headers: {
      Accept: "application/json",
      ...(method === "GET" ? {} : { Origin: frontend }),
      ...(data === undefined ? {} : { "content-type": "application/json" }),
      ...(cookie ? {cookie} : {})
    },
    ...(data === undefined ? {} : {body:JSON.stringify(data)}),
    redirect:"manual"
  });
  const body = await response.json().catch(()=>null);
  return {response,body};
}
const assertStatus = (result, status, step) =>
  assert.equal(result.response.status, status, step + ": " + JSON.stringify(result.body));

try {
  await waitUntilReady(backend + "/health/db");
  await waitUntilReady(frontend + "/");
  await client.connect();

  const publicHome = await fetch(backend + "/");
  assert.equal(publicHome.status,200);
  const intro = await publicHome.json();
  assert.match(intro.message,/Express.js/);

  const register = await jsonRequest("/api/auth/sign-up/email",{
    method:"POST",data:{name:"CI Demo User",email,password}
  });
  assertStatus(register,200,"Registration");
  const getCookie = headers => (typeof headers.getSetCookie === "function"
    ? headers.getSetCookie()
    : [headers.get("set-cookie")].filter(Boolean))
    .map(x=>x.split(";")[0]).filter(Boolean).join("; ");
  let cookie = getCookie(register.response.headers);
  if (!cookie) {
    const login = await jsonRequest("/api/auth/sign-in/email",{
      method:"POST",data:{email,password}
    });
    assertStatus(login,200,"Login");
    cookie = getCookie(login.response.headers);
  }
  assert.ok(cookie,"Expected Better Auth session cookie");

  const users = client.db("doctor-tracker").collection("user");
  const stored = await users.findOne({email});
  assert.ok(stored,"Better Auth user persisted in MongoDB");
  assert.equal(stored.role,"user","New users must always receive role=user");
  const denied = await jsonRequest("/api/backend/stats",{cookie});
  assertStatus(denied,403,"User must not access dashboard API");

  await users.updateOne({_id:stored._id},{$set:{role:"admin"}});
  let stats = await jsonRequest("/api/backend/stats",{cookie});
  assertStatus(stats,200,"Approved admin can access stats without logging in again");
  assert.equal(stats.body.totalDoctors,0);
  assert.equal(stats.body.totalPatients,0);

  const doc = await jsonRequest("/api/backend/doctors",{
    method:"POST",cookie,
    data:{name:"Dr. Demo John",specialty:"Cardiologist",hospital:"Demo Hospital",phone:"+8801700000000",email:"demo-doctor@example.test"}
  });
  assertStatus(doc,201,"Create doctor");
  const doctorId=doc.body._id;
  assert.ok(doctorId);

  const doctors = await jsonRequest("/api/backend/doctors?search=dr.%20demo&page=1&limit=10",{cookie});
  assertStatus(doctors,200,"Search doctors");
  assert.equal(doctors.body.pagination.total,1);

  const patient=await jsonRequest("/api/backend/patients",{
    method:"POST",cookie,
    data:{name:"Demo Patient",age:29,condition:"General Checkup",doctorId}
  });
  assertStatus(patient,201,"Add patient to doctor");
  const patientId=patient.body._id;
  assert.ok(patientId);

  const patients=await jsonRequest("/api/backend/patients?doctorId="+doctorId+"&condition=General%20Checkup",{cookie});
  assertStatus(patients,200,"Filter associated patients");
  assert.equal(patients.body.pagination.total,1);
  assert.equal(patients.body.items[0].doctorId,doctorId);

  stats = await jsonRequest("/api/backend/stats",{cookie});
  assertStatus(stats,200,"Dashboard aggregation");
  assert.equal(stats.body.totalDoctors,1);
  assert.equal(stats.body.totalPatients,1);
  assert.equal(stats.body.patientsPerDoctor[0].count,1);

  const update=await jsonRequest("/api/backend/patients/"+patientId,{
    method:"PUT",cookie,data:{name:"Demo Patient Updated",age:30,condition:"General Checkup",doctorId}
  });
  assertStatus(update,200,"Edit patient");

  const blockedDelete = await jsonRequest("/api/backend/doctors/"+doctorId,{method:"DELETE",cookie});
  assertStatus(blockedDelete,409,"Cannot delete doctor with patients");
  assertStatus(await jsonRequest("/api/backend/patients/"+patientId,{method:"DELETE",cookie}),200,"Delete patient");
  assertStatus(await jsonRequest("/api/backend/doctors/"+doctorId,{method:"DELETE",cookie}),200,"Delete doctor");

  await users.updateOne({_id:stored._id},{$set:{role:"user"}});
  assertStatus(await jsonRequest("/api/backend/stats",{cookie}),403,"Demoted admin access revoked immediately");
  console.log("PASS: registration, user role, approval, CRUD, filtering, analytics and revocation");
} finally {
  await client.close();
}
