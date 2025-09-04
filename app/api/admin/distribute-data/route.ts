import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { distributeReportData, distributeAllReports } from '@/lib/data-distribution';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { clientId, monthYear, distributeAll = false } = body;

    if (distributeAll) {
      // Distribute all existing reports
      console.log('📊 Starting distribution of all existing reports...');
      const result = await distributeAllReports();

      return NextResponse.json({
        success: result.success,
        message: `Bulk distribution completed! ${result.recordsDistributed} records distributed to ${result.tablesUpdated.length} tables.`,
        summary: {
          recordsDistributed: result.recordsDistributed,
          tablesUpdated: result.tablesUpdated,
          errors: result.errors
        }
      });

    } else {
      // Distribute specific report
      if (!clientId || !monthYear) {
        return NextResponse.json({
          error: 'clientId and monthYear are required (or set distributeAll: true)'
        }, { status: 400 });
      }

      console.log(`📊 Starting distribution for client ${clientId}, month ${monthYear}...`);
      const result = await distributeReportData(clientId, monthYear);

      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: 'Data distribution failed',
          details: result.errors.join(', ')
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Data distribution completed! ${result.recordsDistributed} records distributed to ${result.tablesUpdated.length} tables.`,
        summary: {
          recordsDistributed: result.recordsDistributed,
          tablesUpdated: result.tablesUpdated
        }
      });
    }

  } catch (error) {
    console.error('❌ Data distribution API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Distribution operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}