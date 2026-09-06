import { Incident } from "@prisma/client";

export interface GeoJSONFeature {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  properties: {
    incidentId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  features: GeoJSONFeature[];
}

export function buildIncidentGeoJSON(incident: Incident): GeoJSONFeatureCollection {
  const features: GeoJSONFeature[] = [];

  // Observation context
  const obs = incident.observation as Record<string, any> | null;
  if (obs && obs.longitude && obs.latitude) {
    features.push({
      type: "Feature",
      properties: {
        type: "observation",
        time: obs.observation_time,
        scene_id: obs.scene_id,
      },
      geometry: {
        type: "Point",
        coordinates: [obs.longitude, obs.latitude],
      },
    });
  }

  // System 1: Slick Polygon
  const s1 = incident.system1 as Record<string, any> | null;
  if (s1 && s1.slick_polygon) {
    features.push({
      type: "Feature",
      properties: {
        type: "slick",
        age_prediction: s1.age_prediction,
        quality: s1.quality,
      },
      geometry: s1.slick_polygon,
    });
  }

  // System 2: Origin Contours
  const s2 = incident.system2 as Record<string, any> | null;
  if (s2 && s2.origin_contours) {
    for (const [probability, polygon] of Object.entries(s2.origin_contours)) {
      features.push({
        type: "Feature",
        properties: {
          type: "origin_contour",
          probability,
          age_interval: s2.age_interval_hours,
        },
        geometry: polygon as any,
      });
    }
  }

  // System 3: Vessel Tracks (if they included a track_uri, we'd fetch it, but here we just list candidates if they have coordinates)
  // According to SIH spec, the full track might be external (track_uri)
  // For MVP, if there are candidates with a closest point of approach in features, we could plot them.
  const s3 = incident.system3 as Record<string, any> | null;
  if (s3 && Array.isArray(s3.candidates)) {
    // Just metadata for now since full track is external
  }

  return {
    type: "FeatureCollection",
    properties: {
      incidentId: incident.id,
      status: incident.status,
      createdAt: incident.createdAt.toISOString(),
      updatedAt: incident.updatedAt.toISOString(),
    },
    features,
  };
}
