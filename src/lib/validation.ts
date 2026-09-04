import { z } from "zod";

// ─── GeoJSON Base Schemas ──────────────────────────────────────────────

const PositionSchema = z.array(z.number()).min(2).max(3);

const PointGeometrySchema = z.object({
  type: z.literal("Point"),
  coordinates: PositionSchema,
});

const LineStringGeometrySchema = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(PositionSchema).min(2),
});

const PolygonGeometrySchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(PositionSchema).min(4)), // At least 4 points (closed ring)
});

const GeoJSONGeometrySchema = z.union([
  PointGeometrySchema,
  LineStringGeometrySchema,
  PolygonGeometrySchema,
]);

// ─── Stage Payloads ────────────────────────────────────────────────────

/** System 1: Oil slick detection output */
export const System1PayloadSchema = z.object({
  polygon: PolygonGeometrySchema,
  ageWindowHours: z.number().positive(),
  confidence: z.number().min(0).max(1),
});

/** System 2: Drift analysis output */
export const System2PayloadSchema = z.object({
  originRegion: PolygonGeometrySchema,
  originTimeWindow: z.string(),
  driftPath: LineStringGeometrySchema,
});

/** Single vessel attribution result */
export const VesselSchema = z.object({
  vesselId: z.string(),
  name: z.string(),
  proximityScore: z.number().min(0).max(1),
  trajectoryScore: z.number().min(0).max(1),
  anomalyNotes: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

/** System 3: AIS vessel attribution output */
export const System3PayloadSchema = z.object({
  vessels: z.array(VesselSchema).min(1),
});

/** Source references */
export const SourceRefsSchema = z.object({
  sarSceneId: z.string().optional(),
  sarSourceUrl: z.string().url().optional(),
  aisSourceId: z.string().optional(),
  aisSourceUrl: z.string().url().optional(),
  previewImageUrl: z.string().url().optional(),
});

// ─── Stage Update Request ──────────────────────────────────────────────

export const StageNames = [
  "detected",
  "drift_calculated",
  "attributed",
  "complete",
] as const;

export type StageName = (typeof StageNames)[number];

export const StageUpdateSchema = z.discriminatedUnion("stage", [
  z.object({
    stage: z.literal("detected"),
    data: System1PayloadSchema,
    sourceRefs: SourceRefsSchema.optional(),
  }),
  z.object({
    stage: z.literal("drift_calculated"),
    data: System2PayloadSchema,
    sourceRefs: SourceRefsSchema.optional(),
  }),
  z.object({
    stage: z.literal("attributed"),
    data: System3PayloadSchema,
    sourceRefs: SourceRefsSchema.optional(),
  }),
  z.object({
    stage: z.literal("complete"),
    data: z
      .object({
        resolved: z.boolean().default(true),
      })
      .optional(),
  }),
]);

export type StageUpdateInput = z.infer<typeof StageUpdateSchema>;

// ─── Query Params ──────────────────────────────────────────────────────

export const CaseListQuerySchema = z.object({
  status: z
    .enum([
      "detecting",
      "drift_calculating",
      "ais_scanning",
      "confirmed",
      "unresolved",
    ])
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CaseListQuery = z.infer<typeof CaseListQuerySchema>;
