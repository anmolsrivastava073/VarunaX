import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Case } from '@prisma/client';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottom: '2 solid #1a365d', paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a365d' },
  subtitle: { fontSize: 12, color: '#4a5568', marginTop: 4 },
  badge: { fontSize: 10, color: '#2b6cb0', marginTop: 4 },
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginBottom: 6, borderBottom: '1 solid #e2e8f0', paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 140, fontWeight: 'bold', color: '#4a5568' },
  value: { flex: 1, color: '#1a202c' },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#edf2f7', padding: 6, borderBottom: '1 solid #cbd5e0' },
  tableHeaderCell: { flex: 1, fontWeight: 'bold', fontSize: 9, color: '#2d3748' },
  tableRow: { flexDirection: 'row', padding: 6, borderBottom: '1 solid #e2e8f0' },
  tableCell: { flex: 1, fontSize: 9 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#a0aec0', borderTop: '1 solid #e2e8f0', paddingTop: 8 },
});

interface CaseReportProps {
  caseRecord: Case;
}

export function CaseReportPDF({ caseRecord }: CaseReportProps) {
  const system1 = caseRecord.system1 as Record<string, any> | null;
  const system2 = caseRecord.system2 as Record<string, any> | null;
  const system3 = caseRecord.system3 as Record<string, any> | null;
  const sourceRefs = caseRecord.sourceRefs as Record<string, any> | null;

  const vessels = system3?.vessels as Array<Record<string, any>> | undefined;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Case Dossier: {caseRecord.id}</Text>
          <Text style={styles.subtitle}>
            Generated: {new Date().toISOString().split('T')[0]}
          </Text>
          <Text style={styles.badge}>Status: {caseRecord.status.toUpperCase()}</Text>
        </View>

        {/* Case Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Case Overview</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Case ID:</Text>
            <Text style={styles.value}>{caseRecord.id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{caseRecord.status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>{caseRecord.createdAt.toISOString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Last Updated:</Text>
            <Text style={styles.value}>{caseRecord.updatedAt.toISOString()}</Text>
          </View>
        </View>

        {/* System 1: Detection */}
        {system1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System 1 — Oil Slick Detection</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Confidence:</Text>
              <Text style={styles.value}>{(system1.confidence * 100).toFixed(1)}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Age Window:</Text>
              <Text style={styles.value}>{system1.ageWindowHours} hours</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Polygon Points:</Text>
              <Text style={styles.value}>{system1.polygon?.coordinates?.[0]?.length ?? 'N/A'}</Text>
            </View>
          </View>
        )}

        {/* System 2: Drift Analysis */}
        {system2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System 2 — Drift Analysis</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Origin Time Window:</Text>
              <Text style={styles.value}>{system2.originTimeWindow}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Drift Path Points:</Text>
              <Text style={styles.value}>{system2.driftPath?.coordinates?.length ?? 'N/A'}</Text>
            </View>
          </View>
        )}

        {/* System 3: Vessel Attribution */}
        {vessels && vessels.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System 3 — Vessel Attribution Rankings</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>Rank</Text>
                <Text style={styles.tableHeaderCell}>Vessel ID</Text>
                <Text style={styles.tableHeaderCell}>Name</Text>
                <Text style={styles.tableHeaderCell}>Proximity</Text>
                <Text style={styles.tableHeaderCell}>Trajectory</Text>
                <Text style={styles.tableHeaderCell}>Confidence</Text>
              </View>
              {vessels.map((v: Record<string, any>, i: number) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>#{i + 1}</Text>
                  <Text style={styles.tableCell}>{v.vesselId}</Text>
                  <Text style={styles.tableCell}>{v.name}</Text>
                  <Text style={styles.tableCell}>{(v.proximityScore * 100).toFixed(0)}%</Text>
                  <Text style={styles.tableCell}>{(v.trajectoryScore * 100).toFixed(0)}%</Text>
                  <Text style={styles.tableCell}>{(v.confidence * 100).toFixed(0)}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Source References */}
        {sourceRefs && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Source References</Text>
            {sourceRefs.sarSceneId && (
              <View style={styles.row}>
                <Text style={styles.label}>SAR Scene ID:</Text>
                <Text style={styles.value}>{sourceRefs.sarSceneId}</Text>
              </View>
            )}
            {sourceRefs.aisSourceId && (
              <View style={styles.row}>
                <Text style={styles.label}>AIS Source ID:</Text>
                <Text style={styles.value}>{sourceRefs.aisSourceId}</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Oil Spill Detection & Attribution System — Confidential Briefing Document
        </Text>
      </Page>
    </Document>
  );
}
