import { NextRequest, NextResponse } from 'next/server';
import { getLicenses, addLicense, generateLicenseKey } from '@/lib/license-management';
import { isAdmin } from '@/lib/auth';

// GET - Get all licenses
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const user = await getCurrentUser(request);
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('📥 GET /api/licenses - Request received');
    const licenses = await getLicenses();
    console.log('✅ GET /api/licenses - Returning', licenses.length, 'licenses');
    
    return NextResponse.json({
      success: true,
      licenses,
      total: licenses.length,
    });
  } catch (error) {
    console.error('Error getting licenses:', error);
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

// POST - Create new license
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const user = await getCurrentUser(request);
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      domain,
      domains,
      purchaseDate,
      expiryDate,
      isPermanent,
      type,
      features,
      maxProducts,
      maxOrders,
      notes,
      version,
      allowedVersion,
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !domain || !type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: customerName, customerEmail, domain, type' 
        },
        { status: 400 }
      );
    }

    // Generate license key
    const licenseKey = generateLicenseKey();

    // Create license data
    const licenseData = {
      licenseKey,
      customerName,
      customerEmail,
      customerPhone,
      domain,
      domains: domains || [],
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      isActive: true,
      isPermanent: isPermanent || false,
      version: version || '1.0.0',
      allowedVersion,
      type,
      features: features || [],
      maxProducts,
      maxOrders,
      status: 'active' as const,
      notes,
    };

    const licenseId = await addLicense(licenseData);

    return NextResponse.json({
      success: true,
      licenseId,
      licenseKey,
      message: 'License created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating license:', error);
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

