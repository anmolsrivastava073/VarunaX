import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { Incident } from "@prisma/client";

// Note: Standard fonts (Helvetica, Courier, Times-Roman) do NOT need Font.register.

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11, color: "#333" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#1a365d",
    paddingBottom: 10,
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#1a365d" },
  subtitle: { fontSize: 12, color: "#666", marginTop: 5 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: "#f1f5f9",
    padding: 5,
    marginBottom: 10,
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 150, fontWeight: "bold" },
  value: { flex: 1 },
  candidateBlock: {
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
    paddingLeft: 10,
    marginBottom: 10,
  },
});

const IncidentReport = ({ incident }: { incident: Incident }) => {
  const obs = incident.observation as any;
  const s1 = incident.system1 as any;
  const s2 = incident.system2 as any;
  const s3 = incident.system3 as any;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Incident Dossier</Text>
            <Text style={styles.subtitle}>{incident.id}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text>Status: {(incident.status || "").toUpperCase()}</Text>
            <Text>Generated: {new Date().toISOString().split("T")[0]}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Observation Context</Text>
          {obs ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Scene ID:</Text>
                <Text style={styles.value}>{obs.scene_id || "N/A"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Observation Time:</Text>
                <Text style={styles.value}>{obs.observation_time || "N/A"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Location:</Text>
                <Text style={styles.value}>
                  {obs.latitude != null ? obs.latitude.toFixed(4) : "N/A"},{" "}
                  {obs.longitude != null ? obs.longitude.toFixed(4) : "N/A"}
                </Text>
              </View>
            </>
          ) : (
            <Text>Pending observation data...</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. System 1: Slick Detection</Text>
          {s1 ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Predicted Age:</Text>
                <Text style={styles.value}>
                  {s1.age_prediction?.predicted_age_hours ?? "N/A"} hours (
                  {s1.age_prediction?.age_interval_lower_hours ?? "N/A"}-
                  {s1.age_prediction?.age_interval_upper_hours ?? "N/A"})
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Model Version:</Text>
                <Text style={styles.value}>
                  {s1.age_prediction?.model_version || "N/A"}
                </Text>
              </View>
            </>
          ) : (
            <Text>Pending System 1 analysis...</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. System 2: Origin & Drift</Text>
          {s2 ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Particle Count:</Text>
                <Text style={styles.value}>{s2.particle_count ?? "N/A"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Forcing Provider:</Text>
                <Text style={styles.value}>
                  {s2.provenance?.provider || "N/A"}
                </Text>
              </View>
              {s2.summary && (
                <View style={styles.row}>
                  <Text style={styles.label}>Estimated Origin:</Text>
                  <Text style={styles.value}>
                    {s2.summary.center_latitude?.toFixed(4)},{" "}
                    {s2.summary.center_longitude?.toFixed(4)}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text>Pending System 2 drift analysis...</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. System 3: Vessel Attribution</Text>
          {s3 && Array.isArray(s3.candidates) && s3.candidates.length > 0 ? (
            s3.candidates.map((vessel: any, idx: number) => (
              <View key={idx} style={styles.candidateBlock}>
                <Text style={{ fontWeight: "bold" }}>
                  #{vessel.rank ?? idx + 1} - {vessel.name || "Unknown Vessel"} (MMSI:{" "}
                  {vessel.mmsi || "N/A"})
                </Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Compatibility Score:</Text>
                  <Text style={styles.value}>
                    {vessel.compatibility_score != null
                      ? `${(vessel.compatibility_score * 100).toFixed(1)}%`
                      : "N/A"}
                  </Text>
                </View>
                {Array.isArray(vessel.evidence_for) && vessel.evidence_for.length > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Evidence For:</Text>
                    <Text style={styles.value}>
                      {vessel.evidence_for.join(", ")}
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text>Pending System 3 historical AIS analysis...</Text>
          )}
        </View>

        <View style={{ marginTop: 30, paddingTop: 10, borderTopWidth: 1, borderColor: "#ccc" }}>
          <Text style={{ fontSize: 9, color: "#666" }}>
            Note: Compatibility scores represent ranked evidence matching environmental/AIS bounds, not a legal accusation.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export async function generateIncidentPDF(incident: Incident): Promise<Buffer> {
  const pdfBuffer = await renderToBuffer(<IncidentReport incident={incident} /> as any);
  return Buffer.from(pdfBuffer);
}
