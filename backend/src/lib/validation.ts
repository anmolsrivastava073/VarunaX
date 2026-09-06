import { z } from "zod";
import { IncidentStatus } from "@prisma/client";

// ============================================================================
// Core / Shared Types
// ============================================================================

export const GeoJSONPolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
});

export const GeoJSONFeatureSchema = z.object({
  type: z.literal("Feature"),
  geometry: z.record(z.unknown()),
  properties: z.record(z.unknown()).optional(),
});

export const GeoJSONFeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(GeoJSONFeatureSchema),
});

// ============================================================================
// Incident Creation (POST /v1/incidents)
// ============================================================================

export const CreateIncidentSchema = z.object({
  observation_time: z.string().datetime(),
  scene_id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  crs: z.string().default("EPSG:4326"),
});

// ============================================================================
// System 1 Output (POST /v1/incidents/:id/system1)
// ============================================================================

export const System1OutputSchema = z.object({
  observation_time: z.string().datetime(),
  scene_id: z.string(),
  slick_polygon: GeoJSONPolygonSchema,
  mask_uri: z.string().optional(),
  probability_map_uri: z.string().optional(),
  features: z.record(z.unknown()).optional(),
  age_prediction: z.object({
    predicted_age_hours: z.number(),
    age_interval_lower_hours: z.number(),
    age_interval_upper_hours: z.number(),
    model_version: z.string().optional(),
    units: z.string().default("hours"),
  }),
  quality: z.object({
    segmentation_threshold: z.number().optional(),
    warnings: z.array(z.string()).optional(),
  }).optional(),
  provenance: z.record(z.unknown()).optional(),
});

// ============================================================================
// System 2 Output (POST /v1/incidents/:id/system2)
// ============================================================================

export const System2OutputSchema = z.object({
  observation_time: z.string().datetime(),
  age_interval_hours: z.tuple([z.number(), z.number()]),
  particle_count: z.number(),
  origin_contours: z.record(z.string(), GeoJSONPolygonSchema),
  particle_endpoints_uri: z.string().optional(),
  summary: z.object({
    center_longitude: z.number(),
    center_latitude: z.number(),
    spread_longitude: z.number(),
    spread_latitude: z.number(),
  }).optional(),
  quality: z.object({
    warnings: z.array(z.string()).optional(),
    forcing_resolution: z.record(z.unknown()).optional(),
    multimodal: z.boolean().optional(),
  }).optional(),
  provenance: z.object({
    provider: z.string().optional(),
    datasets: z.array(z.string()).optional(),
  }).optional(),
});

// ============================================================================
// System 3 Output (POST /v1/incidents/:id/system3)
// ============================================================================

export const CandidateSchema = z.object({
  rank: z.number(),
  mmsi: z.string(),
  imo: z.string().optional().nullable(),
  name: z.string().optional(),
  compatibility_score: z.number(),
  score_scale: z.string().optional(),
  features: z.record(z.unknown()).optional(),
  evidence_for: z.array(z.string()).optional(),
  evidence_against: z.array(z.string()).optional(),
  track_uri: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  quality: z.record(z.unknown()).optional(),
});

export const System3OutputSchema = z.object({
  incident_id: z.string(),
  status: z.string(),
  coverage: z.object({
    sources: z.array(z.string()),
    time_start: z.string().datetime(),
    time_end: z.string().datetime(),
    coverage_warning: z.string().nullable().optional(),
  }).optional(),
  candidates: z.array(CandidateSchema),
  warnings: z.array(z.string()).optional(),
});

// ============================================================================
// List Query Params
// ============================================================================

export const IncidentListQuerySchema = z.object({
  status: z.nativeEnum(IncidentStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
