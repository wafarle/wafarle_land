import { NextRequest, NextResponse } from 'next/server';
import { verifyLicense } from '@/lib/license-management';

// POST - Verify a license
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { licenseKey, domain, currentVersion } = body;

    // Validate inputs
    if (!licenseKey || !domain) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: licenseKey, domain' 
        },
        { status: 400 }
      );
    }

    const verification = await verifyLicense(
      licenseKey, 
      domain, 
      currentVersion || '1.0.0'
    );

    if (!verification.valid) {
      return NextResponse.json(
        { 
          success: false,
          valid: false,
          message: verification.message,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      license: verification.license,
      message: verification.message,
    });
  } catch (error) {
    console.error('Error verifying license:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

