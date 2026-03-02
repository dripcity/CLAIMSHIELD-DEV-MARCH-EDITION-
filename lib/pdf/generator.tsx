import { Document, Page, Text, View, StyleSheet, PDFRenderer } from '@react-pdf/renderer';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 10,
    color: '#1e40af',
    marginBottom: 20,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
  coverPage: {
    padding: 60,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 40,
    textAlign: 'center',
  },
  dvBox: {
    backgroundColor: '#10b981',
    padding: 20,
    borderRadius: 8,
    marginVertical: 30,
  },
  dvLabel: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  dvAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  vehicleInfo: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 120,
  },
  infoValue: {
    fontSize: 12,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  warningBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #f59e0b',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  warningText: {
    color: '#92400e',
    fontWeight: 'bold',
  },
});

interface AppraisalReportProps {
  appraisal: any;
}

export function AppraisalReport({ appraisal }: AppraisalReportProps) {
  const { subjectVehicle, valuationResults, ownerInfo, appraisalDate, severityAnalysis } = appraisal;
  
  return (
    <Document>
      <Page size={{ width: 595.28, height: 841.89 }} style={styles.coverPage}>
        <Text style={styles.title}>Diminished Value Appraisal</Text>
        <Text style={styles.subtitle}>Professional Vehicle Valuation Report</Text>
        
        <View style={styles.dvBox}>
          <Text style={styles.dvLabel}>Calculated Diminished Value</Text>
          <Text style={styles.dvAmount}>
            ${valuationResults?.diminishedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        
        <View style={styles.vehicleInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehicle:</Text>
            <Text style={styles.infoValue}>
              {subjectVehicle?.year} {subjectVehicle?.make} {subjectVehicle?.model} {subjectVehicle?.trim}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>VIN:</Text>
            <Text style={styles.infoValue}>{subjectVehicle?.vin}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mileage:</Text>
            <Text style={styles.infoValue}>{subjectVehicle?.mileage.toLocaleString()} miles</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Owner:</Text>
            <Text style={styles.infoValue}>
              {ownerInfo?.firstName} {ownerInfo?.lastName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Appraisal Date:</Text>
            <Text style={styles.infoValue}>
              {formatDate(appraisalDate || new Date())}
            </Text>
          </View>
        </View>
        
        {severityAnalysis?.severityLevel && severityAnalysis.severityLevel >= 4 && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ STRUCTURAL DAMAGE DETECTED</Text>
            <Text>This vehicle has structural damage which affects its market value.</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function generatePDF(appraisal: any): Promise<Buffer> {
  const pdfDocument = <AppraisalReport appraisal={appraisal} />;
  const pdfBuffer = await PDFRenderer.renderToBuffer(pdfDocument);
  return pdfBuffer;
}
