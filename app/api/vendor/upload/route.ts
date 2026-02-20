import { NextRequest, NextResponse } from 'next/server';
import { requireVendor } from '@/lib/rbac';
import { uploadFile, validateImageFile } from '@/lib/blob';

export async function POST(request: NextRequest) {
  try {
    const vendor = await requireVendor();
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Determine upload path
    const fileType = formData.get('type') as string || 'product';
    const timestamp = Date.now();
    const filename = `${fileType}/${vendor.vendorId}/${timestamp}-${file.name}`;

    // Upload to Vercel Blob
    const url = await uploadFile(file, filename);

    return NextResponse.json({
      success: true,
      data: { url },
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
