/**
 * Mock data for the oil spill detection pipeline.
 * Used by both the simulator script and the database seed.
 */

// ─── System 1: Detection ───────────────────────────────────────────────

/** Mock oil slick polygon in the Arabian Sea (off Mumbai coast) */
export const mockSystem1 = {
  polygon: {
    type: 'Polygon' as const,
    coordinates: [
      [
        [71.85, 18.92],
        [71.92, 18.95],
        [71.95, 18.88],
        [71.90, 18.84],
        [71.85, 18.86],
        [71.85, 18.92],
      ],
    ],
  },
  ageWindowHours: 12,
  confidence: 0.87,
};

// ─── System 2: Drift Analysis ──────────────────────────────────────────

/** Mock drift analysis with origin region and drift path */
export const mockSystem2 = {
  originRegion: {
    type: 'Polygon' as const,
    coordinates: [
      [
        [71.80, 19.00],
        [71.88, 19.02],
        [71.90, 18.96],
        [71.82, 18.95],
        [71.80, 19.00],
      ],
    ],
  },
  originTimeWindow: '2026-09-03T06:00:00Z / 2026-09-03T14:00:00Z',
  driftPath: {
    type: 'LineString' as const,
    coordinates: [
      [71.84, 18.98],
      [71.86, 18.96],
      [71.87, 18.94],
      [71.88, 18.92],
      [71.89, 18.90],
      [71.90, 18.88],
    ],
  },
};

// ─── System 3: Vessel Attribution ──────────────────────────────────────

/** Mock vessel attribution rankings */
export const mockSystem3 = {
  vessels: [
    {
      vesselId: 'IMO-9434761',
      name: 'MV Pacific Trader',
      proximityScore: 0.92,
      trajectoryScore: 0.88,
      anomalyNotes: 'AIS gap of 4.2 hours near spill origin; speed reduction from 12kn to 2kn',
      confidence: 0.91,
    },
    {
      vesselId: 'IMO-9281043',
      name: 'MT Arabian Dawn',
      proximityScore: 0.78,
      trajectoryScore: 0.65,
      anomalyNotes: 'Course deviation of 23 degrees near origin region',
      confidence: 0.72,
    },
    {
      vesselId: 'IMO-9567234',
      name: 'MV Coastal Spirit',
      proximityScore: 0.61,
      trajectoryScore: 0.54,
      anomalyNotes: 'Routine transit; no significant anomalies detected',
      confidence: 0.45,
    },
  ],
};

// ─── Source References ─────────────────────────────────────────────────

export const mockSourceRefs = {
  sarSceneId: 'S1A_IW_GRDH_20260903T012345',
  sarSourceUrl: 'https://scihub.copernicus.eu/dhus/odata/v1/Products("abc-123")',
  aisSourceId: 'AISHUB-FEED-20260903',
  aisSourceUrl: 'https://www.aishub.net/api/feed/123',
  previewImageUrl: 'https://storage.example.com/cases/preview-20260903.png',
};

// ─── Additional Seed Cases ─────────────────────────────────────────────

/** Pre-built cases in various statuses for dashboard development */
export const seedCases = [
  {
    id: 'CASE-2026-001',
    status: 'confirmed' as const,
    system1: mockSystem1,
    system2: mockSystem2,
    system3: mockSystem3,
    sourceRefs: mockSourceRefs,
  },
  {
    id: 'CASE-2026-002',
    status: 'unresolved' as const,
    system1: {
      ...mockSystem1,
      confidence: 0.62,
      polygon: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [72.10, 19.10],
            [72.18, 19.12],
            [72.20, 19.05],
            [72.12, 19.03],
            [72.10, 19.10],
          ],
        ],
      },
    },
    system2: {
      ...mockSystem2,
      originTimeWindow: '2026-08-28T10:00:00Z / 2026-08-28T18:00:00Z',
    },
    system3: {
      vessels: [
        {
          vesselId: 'IMO-9112345',
          name: 'MV Unknown Vessel',
          proximityScore: 0.55,
          trajectoryScore: 0.42,
          anomalyNotes: 'Insufficient data for conclusive attribution',
          confidence: 0.38,
        },
      ],
    },
    sourceRefs: mockSourceRefs,
  },
  {
    id: 'CASE-2026-003',
    status: 'ais_scanning' as const,
    system1: mockSystem1,
    system2: mockSystem2,
    system3: null,
    sourceRefs: mockSourceRefs,
  },
  {
    id: 'CASE-2026-004',
    status: 'drift_calculating' as const,
    system1: { ...mockSystem1, confidence: 0.94 },
    system2: null,
    system3: null,
    sourceRefs: { sarSceneId: 'S1B_IW_GRDH_20260901T065432', sarSourceUrl: 'https://scihub.copernicus.eu/dhus/odata/v1/Products("def-456")' },
  },
  {
    id: 'CASE-2026-005',
    status: 'detecting' as const,
    system1: null,
    system2: null,
    system3: null,
    sourceRefs: null,
  },
  {
    id: 'CASE-2026-006',
    status: 'confirmed' as const,
    system1: {
      polygon: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [54.30, 24.45],
            [54.38, 24.48],
            [54.40, 24.42],
            [54.32, 24.40],
            [54.30, 24.45],
          ],
        ],
      },
      ageWindowHours: 8,
      confidence: 0.91,
    },
    system2: {
      originRegion: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [54.25, 24.50],
            [54.35, 24.52],
            [54.37, 24.47],
            [54.27, 24.45],
            [54.25, 24.50],
          ],
        ],
      },
      originTimeWindow: '2026-08-15T02:00:00Z / 2026-08-15T10:00:00Z',
      driftPath: {
        type: 'LineString' as const,
        coordinates: [
          [54.30, 24.50],
          [54.32, 24.48],
          [54.34, 24.46],
          [54.35, 24.44],
        ],
      },
    },
    system3: {
      vessels: [
        {
          vesselId: 'IMO-9823456',
          name: 'MT Gulf Star',
          proximityScore: 0.95,
          trajectoryScore: 0.91,
          anomalyNotes: 'Complete AIS blackout for 6 hours; bilge pump activity detected',
          confidence: 0.94,
        },
        {
          vesselId: 'IMO-9654321',
          name: 'MV Desert Wind',
          proximityScore: 0.70,
          trajectoryScore: 0.62,
          anomalyNotes: 'Minor course deviation',
          confidence: 0.58,
        },
      ],
    },
    sourceRefs: mockSourceRefs,
  },
  {
    id: 'CASE-2025-042',
    status: 'confirmed' as const,
    system1: mockSystem1,
    system2: mockSystem2,
    system3: mockSystem3,
    sourceRefs: mockSourceRefs,
  },
  {
    id: 'CASE-2025-041',
    status: 'unresolved' as const,
    system1: mockSystem1,
    system2: mockSystem2,
    system3: { vessels: [] },
    sourceRefs: mockSourceRefs,
  },
];
