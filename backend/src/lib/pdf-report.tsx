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

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#0D2B45", backgroundColor: "#f5f9fb" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 3,
    borderBottomColor: "#1E5A6E",
    paddingBottom: 15,
    marginBottom: 25,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#0D2B45", textTransform: "uppercase" },
  subtitle: { fontSize: 12, color: "#6BA7A0", marginTop: 4, fontWeight: "bold" },
  section: {
    marginBottom: 15,
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B7D4E6",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E5A6E",
    marginBottom: 10,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#e9f2f7",
    paddingBottom: 5,
  },
  row: { flexDirection: "row", marginBottom: 6, alignItems: "center" },
  label: { width: 140, fontWeight: "bold", color: "#6BA7A0", fontSize: 10 },
  value: { flex: 1, color: "#0D2B45", fontSize: 10 },
  candidateBlock: {
    borderLeftWidth: 4,
    borderLeftColor: "#6BA7A0",
    backgroundColor: "#e9f2f7",
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
  },
  footer: { marginTop: 30, paddingTop: 10, borderTopWidth: 1, borderColor: "#B7D4E6", textAlign: "center" },
  footerText: { fontSize: 8, color: "#6BA7A0" },
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
            <Text style={styles.title}>OceanSentinel Forensic Dossier</Text>
            <Text style={styles.subtitle}>Reference: {incident.id}</Text>
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
                <Text style={styles.label}>Coordinates:</Text>
                <Text style={styles.value}>
                  {obs.latitude != null ? obs.latitude.toFixed(4) : "N/A"}°N,{" "}
                  {obs.longitude != null ? obs.longitude.toFixed(4) : "N/A"}°E
                </Text>
              </View>
            </>
          ) : (
            <Text>Pending observation data...</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. System 1: SAR Morphology</Text>
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
          <Text style={styles.sectionTitle}>3. System 2: Origin & Drift Hindcast</Text>
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
                    {s2.summary.center_latitude?.toFixed(4)}°N,{" "}
                    {s2.summary.center_longitude?.toFixed(4)}°E
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
                <Text style={{ fontWeight: "bold", fontSize: 12, marginBottom: 4 }}>
                  #{vessel.rank ?? idx + 1} - {vessel.name || "Unknown Vessel"} (MMSI:{" "}
                  {vessel.mmsi || "N/A"})
                </Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Compatibility Score:</Text>
                  <Text style={{ ...styles.value, color: "#007ceb", fontWeight: "bold" }}>
                    {vessel.compatibility_score != null
                      ? `${(vessel.compatibility_score * 100).toFixed(1)}%`
                      : "N/A"}
                  </Text>
                </View>
                {Array.isArray(vessel.evidence_for) && vessel.evidence_for.length > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Evidence Log:</Text>
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

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            CONFIDENTIAL • OceanSentinel Maritime Intelligence
          </Text>
          <Text style={styles.footerText}>
            Compatibility scores represent ranked evidence matching environmental/AIS bounds, not a legal accusation.
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
