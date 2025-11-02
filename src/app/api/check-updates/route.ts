import { NextRequest, NextResponse } from 'next/server';
import { getLatestVersion, checkForUpdates, verifyLicense } from '@/lib/license-management';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      licenseKey, 
      domain, 
      currentVersion 
    } = body;

    // Validate inputs
    if (!licenseKey || !domain || !currentVersion) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: licenseKey, domain, currentVersion' 
        },
        { status: 400 }
      );
    }

    // Verify license
    const licenseVerification = await verifyLicense(licenseKey, domain, currentVersion);
    
    if (!licenseVerification.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'License verification failed',
          message: licenseVerification.message 
        },
        { status: 403 }
      );
    }

    // Check for updates
    const updateCheck = await checkForUpdates(currentVersion);
    const latestVersion = await getLatestVersion();

    return NextResponse.json({
      success: true,
      license: {
        valid: true,
        type: licenseVerification.license?.type,
        status: licenseVerification.license?.status,
        expiryDate: licenseVerification.license?.expiryDate,
        isPermanent: licenseVerification.license?.isPermanent,
      },
      currentVersion,
      latestVersion: latestVersion?.version,
      hasUpdate: updateCheck.hasUpdate,
      updateInfo: updateCheck.hasUpdate ? {
        version: updateCheck.latestVersion?.version,
        title: updateCheck.latestVersion?.title,
        description: updateCheck.latestVersion?.description,
        features: updateCheck.latestVersion?.features,
        bugFixes: updateCheck.latestVersion?.bugFixes,
        breaking: updateCheck.latestVersion?.breaking,
        downloadUrl: updateCheck.latestVersion?.downloadUrl,
        documentationUrl: updateCheck.latestVersion?.documentationUrl,
        minRequiredVersion: updateCheck.latestVersion?.minRequiredVersion,
      } : null,
      message: updateCheck.message,
    });
  } catch (error) {
    console.error('Error checking updates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const latestVersion = await getLatestVersion();

    if (!latestVersion) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No version information available' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      version: latestVersion.version,
      title: latestVersion.title,
      description: latestVersion.description,
      releaseDate: latestVersion.releaseDate,
      isStable: latestVersion.isStable,
      downloadUrl: latestVersion.downloadUrl,
      documentationUrl: latestVersion.documentationUrl,
    });
  } catch (error) {
    console.error('Error getting latest version:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

