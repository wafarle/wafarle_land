import { NextRequest, NextResponse } from 'next/server';
import { getVersions, addVersion, getLatestVersion } from '@/lib/license-management';

// GET - Get all versions or latest version
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latest = searchParams.get('latest');

    if (latest === 'true') {
      const version = await getLatestVersion();
      
      if (!version) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'No version found' 
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        version,
      });
    }

    const versions = await getVersions();
    
    return NextResponse.json({
      success: true,
      versions,
      total: versions.length,
    });
  } catch (error) {
    console.error('Error getting versions:', error);
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

// POST - Create new version
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      version,
      title,
      description,
      releaseDate,
      isLatest,
      isStable,
      isBeta,
      features,
      bugFixes,
      breaking,
      downloadUrl,
      documentationUrl,
      minRequiredVersion,
      supportedLicenseTypes,
      releaseNotes,
    } = body;

    // Validate required fields
    if (!version || !title) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: version, title' 
        },
        { status: 400 }
      );
    }

    const versionData = {
      version,
      title,
      description,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      isLatest: isLatest || false,
      isStable: isStable !== undefined ? isStable : true,
      isBeta: isBeta || false,
      features: features || [],
      bugFixes: bugFixes || [],
      breaking: breaking || [],
      downloadUrl,
      documentationUrl,
      minRequiredVersion,
      supportedLicenseTypes: supportedLicenseTypes || ['basic', 'professional', 'enterprise'],
      releaseNotes,
    };

    const versionId = await addVersion(versionData);

    return NextResponse.json({
      success: true,
      versionId,
      message: 'Version created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating version:', error);
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

