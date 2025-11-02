import { NextRequest, NextResponse } from 'next/server';
import { updateVersion, deleteVersion } from '@/lib/license-management';

// PUT - Update version
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { id: _, createdAt, updatedAt, ...updateData } = body;

    // Convert date strings to Date objects if present
    if (updateData.releaseDate) {
      updateData.releaseDate = new Date(updateData.releaseDate);
    }

    await updateVersion(id, updateData);

    return NextResponse.json({
      success: true,
      message: 'Version updated successfully',
    });
  } catch (error) {
    console.error('Error updating version:', error);
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

// DELETE - Delete version
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteVersion(id);

    return NextResponse.json({
      success: true,
      message: 'Version deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting version:', error);
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

