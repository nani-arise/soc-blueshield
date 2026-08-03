import type { SecurityEvent, Incident } from '../data/mockData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function exportEventsToCSV(events: SecurityEvent[]) {
  const headers = ['ID', 'Timestamp', 'Rule ID', 'Event', 'Username', 'Source IP', 'Agent', 'Severity', 'Status', 'Category'];
  const rows = events.map(e => [
    e.id, new Date(e.timestamp).toLocaleString(), e.ruleId, `"${e.event}"`,
    e.username, e.sourceIp, e.agent, e.severity, e.status, e.category,
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  downloadFile(csv, 'security-events.csv', 'text/csv');
}

export function exportIncidentToPDF(incident: Incident) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  let y = margin;

  // Header
  doc.setFillColor(11, 18, 32);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('BlueShield SOC', margin, 18);
  doc.setTextColor(226, 232, 240);
  doc.setFontSize(12);
  doc.text('INCIDENT REPORT', margin, 28);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 210 - margin - 60, 28);

  y = 50;

  // Incident ID banner
  const sevColor = incident.severity === 'critical' ? [239, 68, 68] : incident.severity === 'high' ? [249, 115, 22] : incident.severity === 'medium' ? [234, 179, 8] : [34, 197, 94];
  doc.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
  doc.rect(margin, y, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${incident.id} — ${incident.severity.toUpperCase()} SEVERITY`, margin + 4, y + 5.5);
  y += 14;

  const addField = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(label.toUpperCase(), margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(226, 232, 240);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(value, 130);
    doc.text(lines, margin + 50, y);
    y += 7 * lines.length + 2;
  };

  addField('Title:', incident.title);
  addField('Status:', incident.status.toUpperCase());
  addField('Assigned To:', incident.assignedTo);
  addField('Created:', new Date(incident.createdAt).toLocaleString());
  addField('Last Updated:', new Date(incident.updatedAt).toLocaleString());
  y += 4;

  doc.setDrawColor(30, 58, 95);
  doc.line(margin, y, 210 - margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(59, 130, 246);
  doc.text('INCIDENT DESCRIPTION', margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  const descLines = doc.splitTextToSize(incident.description, 170);
  doc.text(descLines, margin, y);
  y += 7 * descLines.length + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(34, 197, 94);
  doc.text('RECOMMENDED RESPONSE', margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  const respLines = doc.splitTextToSize(incident.recommendedResponse, 170);
  doc.text(respLines, margin, y);
  y += 7 * respLines.length + 8;

  // Workflow stages
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(59, 130, 246);
  doc.text('INCIDENT LIFECYCLE', margin, y);
  y += 7;
  const stages = ['Detection', 'Alert', 'Investigation', 'Containment', 'Eradication', 'Recovery', 'Closure'];
  stages.forEach((stage, i) => {
    const active = i < incident.stage;
    doc.setFillColor(active ? sevColor[0] : 40, active ? sevColor[1] : 55, active ? sevColor[2] : 80);
    doc.circle(margin + 10 + i * 23, y + 4, 4, 'F');
    doc.setFont('helvetica', active ? 'bold' : 'normal');
    doc.setFontSize(7);
    doc.setTextColor(active ? 226 : 100, active ? 232 : 116, active ? 240 : 139);
    doc.text(stage, margin + 3 + i * 23, y + 13, { maxWidth: 20, align: 'center' });
  });
  y += 22;

  // Footer
  doc.setFillColor(11, 18, 32);
  doc.rect(0, 287 - 12, 210, 12, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('CONFIDENTIAL — BlueShield SOC Incident Report', margin, 287 - 4);
  doc.text('Page 1 of 1', 210 - margin - 20, 287 - 4);

  doc.save(`incident-${incident.id}-report.pdf`);
}

export async function exportDashboardToPNG(elementId: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const canvas = await html2canvas(el, {
    backgroundColor: '#0B1220',
    scale: 2,
    useCORS: true,
  });
  const url = canvas.toDataURL('image/png');
  downloadFile(url, 'soc-dashboard-snapshot.png', 'image/png', true);
}

function downloadFile(content: string, filename: string, _mime: string, isDataUrl = false) {
  const a = document.createElement('a');
  if (isDataUrl) {
    a.href = content;
  } else {
    a.href = URL.createObjectURL(new Blob([content], { type: _mime }));
  }
  a.download = filename;
  a.click();
}
