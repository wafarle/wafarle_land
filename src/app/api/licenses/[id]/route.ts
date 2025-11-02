import { NextRequest, NextResponse } from 'next/server';
import { getLicenseById, updateLicense, deleteLicense } from '@/lib/license-management';

// GET - Get license by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📥 GET /api/licenses/[id] - Request for ID:', id);
    const license = await getLicenseById(id);

    if (!license) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'License not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      license,
    });
  } catch (error) {
    console.error('Error getting license:', error);
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

// PUT - Update license
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { id: _, createdAt, updatedAt, ...updateData } = body;

    // Convert date strings to Date objects if present
    if (updateData.purchaseDate) {
      updateData.purchaseDate = new Date(updateData.purchaseDate);
    }
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }
    if (updateData.lastCheckDate) {
      updateData.lastCheckDate = new Date(updateData.lastCheckDate);
    }

    await updateLicense(id, updateData);

    return NextResponse.json({
      success: true,
      message: 'License updated successfully',
    });
  } catch (error) {
    console.error('Error updating license:', error);
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

// DELETE - Delete license
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteLicense(id);

    return NextResponse.json({
      success: true,
      message: 'License deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting license:', error);
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

