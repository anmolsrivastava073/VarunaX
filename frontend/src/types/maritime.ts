export type CaseStatus = "analyzing" | "resolved" | "flagged";
export type SeverityLevel = "critical" | "high" | "moderate" | "minor";

export interface GeoCoordinate {
  lng: number;
  lat: number;
}

export interface DriftParticle {
  id: string;
  history: [number, number][]; // [lng, lat] array from detection to origin
  current: [number, number];
  originEstimate: [number, number];
  weight: number;
}

export interface System1Data {
  sceneId: string;
  satellite: string;
  sensor: string;
  polarization: "VV" | "VH" | "VV+VH";
  resolutionMeters: number;
  acquisitionTimestamp: string;
  slickPolygon: {
    type: "Feature";
    geometry: {
      type: "Polygon";
      coordinates: [number, number][][];
    };
    properties: Record<string, unknown>;
  };
  areaKm2: number;
  perimeterKm: number;
  elongation: number;
  orientationDegrees: number;
  sarTextureEntropy: number;
  oilLookalikeConfidence: number; // probability it is genuine mineral oil vs biogenic sheen (0-100%)
  estimatedSpillAgeHours: {
    min: number;
    max: number;
    bestEstimate: number;
  };
  ageConfidence: number; // 0-100%
  candidateSpillTimeWindow: {
    start: string;
    end: string;
  };
}

export interface System2Data {
  originCoordinates: {
    lat: number;
    lng: number;
  };
  mostProbableTimeWindow: {
    start: string;
    end: string;
  };
  spatialUncertaintyKm: number;
  temporalUncertaintyHours: number;
  oceanCurrent: {
    uVelocity: number; // m/s eastward
    vVelocity: number; // m/s northward
    speedKnots: number;
    headingDegrees: number;
  };
  wind: {
    speedKnots: number;
    directionDegrees: number;
    uComponent: number;
    vComponent: number;
    windageCoefficient: number;
  };
  particleCount: number;
  particles: DriftParticle[];
  originProbabilityEllipse: {
    type: "Feature";
    geometry: {
      type: "Polygon";
      coordinates: [number, number][][];
    };
    properties: {
      probabilityDensity: number;
      radiusKm: number;
    };
  };
  driftPath: [number, number][]; // [lng, lat] from origin to observation
}

export interface AISWaypoint {
  timestamp: string;
  lat: number;
  lng: number;
  sogKnots: number;
  cogDegrees: number;
  headingDegrees: number;
  navStatus: string;
  distanceToOriginKm: number;
  isAnomaly?: boolean;
  anomalyDescription?: string;
}

export interface EvidenceFeatures {
  originProximity: number; // 0-100%
  temporalCompatibility: number; // 0-100%
  trajectoryMatch: number; // 0-100%
  aisContinuity: number; // 0-100% (high score means suspicious dark period/gap identified)
  vesselTypeRelevance: number; // 0-100%
}

export interface RankedVessel {
  rank: number;
  name: string;
  mmsi: string;
  imo: string;
  callSign: string;
  flag: string;
  flagCode: string; // ISO 2-letter country code for flags
  vesselType: string;
  lengthMeters: number;
  beamMeters: number;
  deadweightTonnage: number;
  overallAttributionConfidence: number; // 0-100%
  evidence: EvidenceFeatures;
  aisTrack: AISWaypoint[];
  hasDarkPeriod: boolean;
  darkPeriodDurationHours?: number;
  darkPeriodLocation?: {
    lat: number;
    lng: number;
  };
  isCulpritSuspect: boolean;
  summaryRationale: string;
}

export interface System3Data {
  candidateVesselsEvaluated: number;
  temporalSearchWindowHours: number;
  spatialSearchRadiusKm: number;
  rankedVessels: RankedVessel[];
  primarySuspect: RankedVessel;
}

export interface CaseRecord {
  id: string;
  caseNumber: string;
  title: string;
  region: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: CaseStatus;
  statusLabel: string;
  timestamp: string;
  severity: SeverityLevel;
  estimatedSpillVolumeBarrels: number;
  marineEcosystemRisk: "Extreme" | "High" | "Moderate" | "Guarded";
  nearestShoreDistanceKm: number;
  nearestMarineProtectedArea: string;
  sarPreviewUrl: string;
  system1: System1Data;
  system2: System2Data;
  system3: System3Data;
}

export type PipelineStage = "idle" | "system1_detection" | "system2_drift" | "system3_attribution" | "completed";
