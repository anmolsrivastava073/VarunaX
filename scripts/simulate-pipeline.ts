/**
 * Mock ML Pipeline Simulator
 *
 * Simulates the full oil spill detection pipeline by calling
 * the internal API endpoints in sequence with realistic delays.
 *
 * Usage: npx tsx scripts/simulate-pipeline.ts
 */

import { mockSystem1, mockSystem2, mockSystem3, mockSourceRefs } from './mock-data';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_KEY = process.env.INTERNAL_API_KEY || 'dev-secret-key-change-me';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiCall(method: string, path: string, body?: unknown) {
  const url = `${BASE_URL}${path}`;
  console.log(`  → ${method} ${url}`);

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

async function runSimulation() {
  console.log('\n🚀 Starting Oil Spill Pipeline Simulation');
  console.log('═'.repeat(50));

  // Step 1: Create a new case
  console.log('\n📡 Step 1: Initiating new case...');
  const { caseId } = await apiCall('POST', '/api/internal/cases/start');
  console.log(`  ✓ Case created: ${caseId}`);
  console.log(`  Status: detecting`);

  // Step 2: System 1 — Detection
  console.log('\n⏳ Waiting 3 seconds (simulating SAR image analysis)...');
  await sleep(3000);
  console.log('\n🛰️  Step 2: System 1 — Oil Slick Detected');
  const stage1 = await apiCall('POST', `/api/internal/cases/${caseId}/stage`, {
    stage: 'detected',
    data: mockSystem1,
    sourceRefs: {
      sarSceneId: mockSourceRefs.sarSceneId,
      sarSourceUrl: mockSourceRefs.sarSourceUrl,
      previewImageUrl: mockSourceRefs.previewImageUrl,
    },
  });
  console.log(`  ✓ Detection polygon stored (confidence: ${mockSystem1.confidence})`);
  console.log(`  Status: ${stage1.status}`);

  // Step 3: System 2 — Drift Calculation
  console.log('\n⏳ Waiting 4 seconds (simulating drift model computation)...');
  await sleep(4000);
  console.log('\n🌊 Step 3: System 2 — Drift Path Calculated');
  const stage2 = await apiCall('POST', `/api/internal/cases/${caseId}/stage`, {
    stage: 'drift_calculated',
    data: mockSystem2,
  });
  console.log(`  ✓ Origin region and drift path stored`);
  console.log(`  ✓ Time window: ${mockSystem2.originTimeWindow}`);
  console.log(`  Status: ${stage2.status}`);

  // Step 4: System 3 — AIS Attribution
  console.log('\n⏳ Waiting 3 seconds (simulating AIS correlation scan)...');
  await sleep(3000);
  console.log('\n🚢 Step 4: System 3 — Vessel Attribution Complete');
  const stage3 = await apiCall('POST', `/api/internal/cases/${caseId}/stage`, {
    stage: 'attributed',
    data: mockSystem3,
    sourceRefs: {
      aisSourceId: mockSourceRefs.aisSourceId,
      aisSourceUrl: mockSourceRefs.aisSourceUrl,
    },
  });
  console.log(`  ✓ ${mockSystem3.vessels.length} vessels ranked`);
  console.log(`  ✓ Top suspect: ${mockSystem3.vessels[0].name} (confidence: ${mockSystem3.vessels[0].confidence})`);
  console.log(`  Status: ${stage3.status}`);

  // Step 5: Mark complete
  console.log('\n✅ Step 5: Marking case as complete');
  const complete = await apiCall('POST', `/api/internal/cases/${caseId}/stage`, {
    stage: 'complete',
    data: { resolved: true },
  });
  console.log(`  ✓ Case ${caseId} finalized`);
  console.log(`  Final status: ${complete.status}`);

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📋 Simulation Complete!');
  console.log(`  Case ID:    ${caseId}`);
  console.log(`  Dashboard:  ${BASE_URL}/api/cases`);
  console.log(`  Detail:     ${BASE_URL}/api/cases/${caseId}`);
  console.log(`  GeoJSON:    ${BASE_URL}/api/report/${caseId}?format=geojson`);
  console.log(`  PDF:        ${BASE_URL}/api/report/${caseId}?format=pdf`);
  console.log('═'.repeat(50) + '\n');
}

runSimulation().catch((error) => {
  console.error('\n❌ Simulation failed:', error.message);
  process.exit(1);
});
