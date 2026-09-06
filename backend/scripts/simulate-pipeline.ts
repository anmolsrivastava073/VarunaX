import { MOCK_INCIDENTS } from "./mock-data";
import { generateIncidentId } from "../src/lib/incident-id";

const API_KEY = "dev-secret-key-change-me";
const BASE_URL = "http://localhost:3000/api/v1";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("🚀 Starting SIH 2026 Pipeline Simulation...");

  // 1. Start new incident
  console.log("\n[1/4] Creating new incident...");
  const startRes = await fetch(`${BASE_URL}/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
    body: JSON.stringify({
      observation_time: new Date().toISOString(),
      scene_id: "SIMULATION_TEST",
      latitude: 10.0,
      longitude: 70.0,
    }),
  });
  
  if (!startRes.ok) throw new Error(await startRes.text());
  const { incidentId } = await startRes.json();
  console.log(`✅ Created ${incidentId}`);

  // Grab the completed mock case to use its data
  const mockData = MOCK_INCIDENTS[0];

  // 2. System 1
  await sleep(2000);
  console.log("\n[2/4] Pushing System 1 (Slick Detection) output...");
  const s1Res = await fetch(`${BASE_URL}/incidents/${incidentId}/system1`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
    body: JSON.stringify(mockData.system1),
  });
  if (!s1Res.ok) throw new Error(await s1Res.text());
  console.log(`✅ System 1 complete`);

  // 3. System 2
  await sleep(3000);
  console.log("\n[3/4] Pushing System 2 (Drift Analysis) output...");
  const s2Res = await fetch(`${BASE_URL}/incidents/${incidentId}/system2`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
    body: JSON.stringify(mockData.system2),
  });
  if (!s2Res.ok) throw new Error(await s2Res.text());
  console.log(`✅ System 2 complete`);

  // 4. System 3
  await sleep(4000);
  console.log("\n[4/4] Pushing System 3 (Vessel Attribution) output...");
  const s3Res = await fetch(`${BASE_URL}/incidents/${incidentId}/system3`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
    body: JSON.stringify(mockData.system3),
  });
  if (!s3Res.ok) throw new Error(await s3Res.text());
  console.log(`✅ System 3 complete`);

  console.log(`\n🎉 Simulation finished! Check ${BASE_URL}/incidents/${incidentId}`);
}

main().catch(console.error);
