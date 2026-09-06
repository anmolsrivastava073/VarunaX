import { IncidentStatus } from "@prisma/client";

export const MOCK_INCIDENTS = [
  {
    id: "INCIDENT_2025_001",
    status: IncidentStatus.completed,
    createdAt: new Date("2025-03-15T05:00:00Z"),
    updatedAt: new Date("2025-03-15T08:00:00Z"),
    observation: {
      observation_time: "2025-03-15T04:32:00Z",
      scene_id: "SCENE_EXAMPLE",
      latitude: 10.0,
      longitude: 70.0,
      crs: "EPSG:4326",
    },
    system1: {
      observation_time: "2025-03-15T04:32:00Z",
      scene_id: "SCENE_EXAMPLE",
      slick_polygon: {
        type: "Polygon",
        coordinates: [
          [
            [70.0, 10.0],
            [70.1, 10.0],
            [70.1, 10.1],
            [70.0, 10.1],
            [70.0, 10.0],
          ],
        ],
      },
      mask_uri: "artifacts/incident/mask.png",
      probability_map_uri: "artifacts/incident/probability.npy",
      features: { area_km2: 15.4, eccentricity: 0.92 },
      age_prediction: {
        predicted_age_hours: 30.5,
        age_interval_lower_hours: 24.0,
        age_interval_upper_hours: 48.0,
        model_version: "v2.0-SIH2026",
        units: "hours",
      },
      quality: {
        segmentation_threshold: 0.6,
        warnings: [],
      },
      provenance: {},
    },
    system2: {
      observation_time: "2025-03-15T04:32:00Z",
      age_interval_hours: [24, 48],
      particle_count: 1000,
      origin_contours: {
        "50": {
          type: "Polygon",
          coordinates: [
            [
              [70.2, 10.0],
              [70.3, 10.0],
              [70.3, 10.1],
              [70.2, 10.1],
              [70.2, 10.0],
            ],
          ],
        },
      },
      particle_endpoints_uri: "artifacts/incident/origin_particles.parquet",
      summary: {
        center_longitude: 70.25,
        center_latitude: 10.05,
        spread_longitude: 0.1,
        spread_latitude: 0.06,
      },
      quality: { warnings: [], multimodal: false },
      provenance: { provider: "CMEMS/GLORYS + ERA5" },
    },
    system3: {
      incident_id: "INCIDENT_2025_001",
      status: "completed",
      coverage: {
        sources: ["local_parquet"],
        time_start: "2025-03-13T04:32:00Z",
        time_end: "2025-03-14T04:32:00Z",
      },
      candidates: [
        {
          rank: 1,
          mmsi: "123456789",
          imo: "9876543",
          name: "Example Vessel",
          compatibility_score: 0.82,
          score_scale: "0_to_1_uncalibrated",
          evidence_for: ["Spatial intersection > 90%"],
          evidence_against: ["Minor AIS gap of 2 hours"],
          track_uri: "artifacts/incident/vessel_123456789.geojson",
        },
      ],
      warnings: [],
    },
  },
  {
    id: "INCIDENT_2026_002",
    status: IncidentStatus.system3_pending,
    createdAt: new Date(),
    updatedAt: new Date(),
    observation: {
      observation_time: "2026-09-01T12:00:00Z",
      scene_id: "SCENE_LIVE",
      latitude: 12.5,
      longitude: 72.1,
      crs: "EPSG:4326",
    },
    system1: {
      observation_time: "2026-09-01T12:00:00Z",
      scene_id: "SCENE_LIVE",
      slick_polygon: {
        type: "Polygon",
        coordinates: [
          [
            [72.1, 12.5],
            [72.2, 12.5],
            [72.2, 12.6],
            [72.1, 12.6],
            [72.1, 12.5],
          ],
        ],
      },
      age_prediction: {
        predicted_age_hours: 12.0,
        age_interval_lower_hours: 8.0,
        age_interval_upper_hours: 16.0,
        units: "hours",
      },
    },
    system2: {
      observation_time: "2026-09-01T12:00:00Z",
      age_interval_hours: [8, 16],
      particle_count: 500,
      origin_contours: {},
    },
    system3: null,
  },
  {
    id: "INCIDENT_2026_003",
    status: IncidentStatus.system1_pending,
    createdAt: new Date(),
    updatedAt: new Date(),
    observation: {
      observation_time: new Date().toISOString(),
      scene_id: "SCENE_NEW",
      latitude: 8.0,
      longitude: 75.0,
      crs: "EPSG:4326",
    },
    system1: null,
    system2: null,
    system3: null,
  },
];
