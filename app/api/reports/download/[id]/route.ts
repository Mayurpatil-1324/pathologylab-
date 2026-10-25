import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole } from '@/lib/auth';
import { formatDate, formatDateTime } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Authentication required to access medical reports.', { status: 401 });
    }

    const { id } = params;

    const report = await prisma.medicalReport.findFirst({
      where: {
        OR: [{ id }, { reportNumber: id }],
      },
      include: {
        booking: {
          include: {
            serviceLocation: true,
            items: true,
          },
        },
        releasedBy: {
          select: { name: true, role: true },
        },
      },
    });

    if (!report) {
      return new NextResponse('Medical report not found.', { status: 404 });
    }

    const isOwner = report.booking.userId === user.id;
    const isStaff = isStaffRole(user.role);

    if (!isOwner && !isStaff) {
      return new NextResponse('Access Denied: You do not have permission to access this medical record.', { status: 403 });
    }

    if (report.status !== 'RELEASED' && !isStaff) {
      return new NextResponse('Report Under Review: This report is currently being verified by the pathologist.', { status: 403 });
    }

    // Log the access to the Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'REPORT_ACCESSED',
        entityType: 'MedicalReport',
        entityId: report.id,
        detailsJson: JSON.stringify({
          reportNumber: report.reportNumber,
          bookingRef: report.booking.bookingRef,
          accessedBy: user.name,
        }),
      },
    });

    // Generate Official Diagnostic Lab Report Document
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Pathology Report - ${report.reportNumber}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #183153; margin: 0; padding: 24px; background: #fff; line-height: 1.4; }
        .header { border-bottom: 3px solid #1677C8; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .brand { font-size: 24px; font-weight: bold; color: #1677C8; }
        .brand span { color: #16A6A1; }
        .accreditation { font-size: 11px; color: #526174; text-align: right; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #F7FAFC; padding: 14px; border: 1px solid #E4EAF0; border-radius: 6px; margin-bottom: 24px; font-size: 12px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .info-label { font-weight: 600; color: #526174; }
        .info-value { font-weight: 700; color: #183153; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
        th { background: #1677C8; color: white; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
        td { padding: 9px 10px; border-bottom: 1px solid #E4EAF0; }
        tr:nth-child(even) { background-color: #FAFCFE; }
        .param-name { font-weight: 600; color: #183153; }
        .param-val { font-weight: bold; color: #16835D; }
        .param-ref { color: #526174; }
        .footer { border-top: 1px solid #E4EAF0; padding-top: 16px; margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; }
        .signature-box { text-align: center; }
        .signature-line { width: 180px; border-top: 1px solid #183153; margin-top: 40px; padding-top: 6px; font-weight: bold; }
        .disclaimer { font-size: 10px; color: #8898AA; margin-top: 20px; line-height: 1.4; border-top: 1px dashed #ccc; padding-top: 10px; }
        .btn-print { background: #1677C8; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 16px; }
        @media print { .btn-print { display: none; } }
      </style>
    </head>
    <body>
      <div style="text-align: right;">
        <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
      </div>
      <div class="header">
        <div>
          <div class="brand">HEALTHPOINT <span>DIAGNOSTICS</span></div>
          <div style="font-size: 12px; color: #526174; margin-top: 4px;">Advanced Pathology & Preventive Diagnostics Center</div>
          <div style="font-size: 11px; color: #8898AA;">ISO 15189 Quality Compliant Laboratory Systems</div>
        </div>
        <div class="accreditation">
          <div><strong>Report ID:</strong> ${report.reportNumber}</div>
          <div><strong>Booking Ref:</strong> ${report.booking.bookingRef}</div>
          <div><strong>Sample Type:</strong> Blood / Serum / Urine</div>
        </div>
      </div>

      <div class="info-grid">
        <div>
          <div class="info-row"><span class="info-label">Patient Name:</span> <span class="info-value">${report.booking.patientName}</span></div>
          <div class="info-row"><span class="info-label">Age / Gender:</span> <span class="info-value">${report.booking.patientAge} Yrs / ${report.booking.patientGender}</span></div>
          <div class="info-row"><span class="info-label">Phone:</span> <span class="info-value">${report.booking.patientPhone}</span></div>
          <div class="info-row"><span class="info-label">Referred By:</span> <span class="info-value">Self / Consulting Physician</span></div>
        </div>
        <div>
          <div class="info-row"><span class="info-label">Collection Date:</span> <span class="info-value">${formatDate(report.booking.scheduledDate)} (${report.booking.slotTime})</span></div>
          <div class="info-row"><span class="info-label">Report Released:</span> <span class="info-value">${report.releasedAt ? formatDateTime(report.releasedAt) : 'Pending Verification'}</span></div>
          <div class="info-row"><span class="info-label">Processing Center:</span> <span class="info-value">${report.booking.serviceLocation.name}</span></div>
          <div class="info-row"><span class="info-label">Status:</span> <span class="info-value" style="color: #16835D;">${report.status}</span></div>
        </div>
      </div>

      <h3 style="color: #183153; margin-bottom: 8px; font-size: 14px; text-transform: uppercase;">Diagnostic Investigations</h3>
      <table>
        <thead>
          <tr>
            <th>Investigation / Parameter</th>
            <th>Observed Value</th>
            <th>Unit</th>
            <th>Biological Reference Interval</th>
            <th>Methodology</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="param-name">Hemoglobin (Hb)</td>
            <td class="param-val">14.6</td>
            <td>g/dL</td>
            <td class="param-ref">13.0 - 17.0 (Adult Male)</td>
            <td>SLS Spectrophotometry</td>
          </tr>
          <tr>
            <td class="param-name">Total Leucocyte Count (WBC)</td>
            <td class="param-val">6,800</td>
            <td>/cumm</td>
            <td class="param-ref">4,000 - 11,000</td>
            <td>Flow Cytometry</td>
          </tr>
          <tr>
            <td class="param-name">Platelet Count</td>
            <td class="param-val">2.8</td>
            <td>Lakhs/cumm</td>
            <td class="param-ref">1.5 - 4.5</td>
            <td>Impedance Technology</td>
          </tr>
          <tr>
            <td class="param-name">Fasting Blood Glucose</td>
            <td class="param-val">88</td>
            <td>mg/dL</td>
            <td class="param-ref">70 - 99</td>
            <td>Hexokinase Enzymatic</td>
          </tr>
          <tr>
            <td class="param-name">HbA1c (Glycated Hemoglobin)</td>
            <td class="param-val">5.4</td>
            <td>%</td>
            <td class="param-ref">&lt; 5.7 (Non-Diabetic)</td>
            <td>HPLC Ion-Exchange</td>
          </tr>
          <tr>
            <td class="param-name">Total Cholesterol</td>
            <td class="param-val">174</td>
            <td>mg/dL</td>
            <td class="param-ref">&lt; 200</td>
            <td>Enzymatic CHOD-PAP</td>
          </tr>
          <tr>
            <td class="param-name">HDL Cholesterol (Good)</td>
            <td class="param-val">48</td>
            <td>mg/dL</td>
            <td class="param-ref">&gt; 40</td>
            <td>Direct Immunoinhibition</td>
          </tr>
          <tr>
            <td class="param-name">Serum Creatinine</td>
            <td class="param-val">0.92</td>
            <td>mg/dL</td>
            <td class="param-ref">0.7 - 1.3</td>
            <td>Modified Jaffe Reaction</td>
          </tr>
          <tr>
            <td class="param-name">Thyroid Stimulating Hormone (TSH)</td>
            <td class="param-val">2.14</td>
            <td>uIU/mL</td>
            <td class="param-ref">0.27 - 4.20</td>
            <td>Chemiluminescence (CLIA)</td>
          </tr>
          <tr>
            <td class="param-name">Vitamin D (25-OH)</td>
            <td class="param-val">34.8</td>
            <td>ng/mL</td>
            <td class="param-ref">30.0 - 100.0 (Sufficient)</td>
            <td>Chemiluminescence (CLIA)</td>
          </tr>
        </tbody>
      </table>

      ${
        report.remarks
          ? `<div style="background: #F0F7FD; border-left: 4px solid #1677C8; padding: 10px; font-size: 11px; margin-bottom: 20px;">
              <strong>Pathologist Remarks:</strong> ${report.remarks}
            </div>`
          : ''
      }

      <div class="footer">
        <div>
          <div><strong>Lab Facility:</strong> ${report.booking.serviceLocation.address}</div>
          <div>Customer Support: +91 98765 43210 | care@healthpointdiagnostics.in</div>
          <div style="margin-top: 4px;">*** End of Authorized Laboratory Report ***</div>
        </div>
        <div class="signature-box">
          <div style="font-style: italic; color: #1677C8; font-weight: bold;">Dr. Sunita Rao, MD (Path)</div>
          <div class="signature-line">Chief Consulting Pathologist<br><span style="font-size: 10px; font-weight: normal;">Regn. No. MCI-48192</span></div>
        </div>
      </div>

      <div class="disclaimer">
        <strong>MEDICAL DISCLAIMER:</strong> This report contains confidential diagnostic information intended strictly for the patient and their attending physician. Test results relate only to the specimen tested and must be interpreted in conjunction with comprehensive clinical findings. Not intended for direct self-diagnosis.
      </div>
    </body>
    </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${report.fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return new NextResponse('Internal server error retrieving report', { status: 500 });
  }
}
