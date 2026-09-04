import { Case } from '@prisma/client';

export interface GeoJSONFeature {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  properties: {
    caseId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  features: GeoJSONFeature[];
}

export function buildCaseGeoJSON(caseRecord: Case): GeoJSONFeatureCollection {
  const features: GeoJSONFeature[] = [];
  const system1 = caseRecord.system1 as Record<string, any> | null;
  const system2 = caseRecord.system2 as Record<string, any> | null;
  const system3 = caseRecord.system3 as Record<string, any> | null;

  // System 1: Detection polygon
  if (system1?.polygon) {
    features.push({
      type: 'Feature',
      properties: {
        layer: 'detection',
        system: 'system1',
        ageWindowHours: system1.ageWindowHours,
        confidence: system1.confidence,
        description: 'Detected oil slick boundary',
      },
      geometry: system1.polygon,
    });
  }

  // System 2: Origin region
  if (system2?.originRegion) {
    features.push({
      type: 'Feature',
      properties: {
        layer: 'origin',
        system: 'system2',
        originTimeWindow: system2.originTimeWindow,
        description: 'Estimated spill origin region',
      },
      geometry: system2.originRegion,
    });
  }

  // System 2: Drift path
  if (system2?.driftPath) {
    features.push({
      type: 'Feature',
      properties: {
        layer: 'drift_path',
        system: 'system2',
        description: 'Modeled oil drift trajectory',
      },
      geometry: system2.driftPath,
    });
  }

  // System 3: Vessel positions (as Point features)
  if (system3?.vessels && Array.isArray(system3.vessels)) {
    system3.vessels.forEach((vessel: any, index: number) => {
      features.push({
        type: 'Feature',
        properties: {
          layer: 'vessel',
          system: 'system3',
          rank: index + 1,
          vesselId: vessel.vesselId,
          name: vessel.name,
          proximityScore: vessel.proximityScore,
          trajectoryScore: vessel.trajectoryScore,
          anomalyNotes: vessel.anomalyNotes,
          confidence: vessel.confidence,
          description: `Suspect vessel #${index + 1}: ${vessel.name}`,
        },
        // Use a placeholder point — in production the ML system would provide actual vessel positions
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
      });
    });
  }

  return {
    type: 'FeatureCollection',
    properties: {
      caseId: caseRecord.id,
      status: caseRecord.status,
      createdAt: caseRecord.createdAt.toISOString(),
      updatedAt: caseRecord.updatedAt.toISOString(),
    },
    features,
  };
}
