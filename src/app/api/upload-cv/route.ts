import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf'];

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get('cv') as File;

		if (!file) {
			return NextResponse.json(
				{ error: 'No file provided' },
				{ status: 400 }
			);
		}

		// Validate file type
		if (!ALLOWED_TYPES.includes(file.type)) {
			return NextResponse.json(
				{ error: 'Only PDF files are allowed' },
				{ status: 400 }
			);
		}

		// Validate file size
		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{ error: 'File size must be less than 5MB' },
				{ status: 400 }
			);
		}

		// Generate unique filename
		const timestamp = Date.now();
		const randomStr = Math.random().toString(36).substring(7);
		const sanitizedOriginalName = file.name
			.replace(/[^a-zA-Z0-9.-]/g, '_')
			.substring(0, 50);
		const uniqueFilename = `${timestamp}-${randomStr}-${sanitizedOriginalName}`;

		// Create path structure: year/month/filename
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const storagePath = `${year}/${month}/${uniqueFilename}`;

		// Convert File to ArrayBuffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Upload to Supabase Storage
		const supabase = getSupabaseAdmin();
		const { data, error } = await supabase.storage
			.from('talent-cvs')
			.upload(storagePath, buffer, {
				contentType: 'application/pdf',
				cacheControl: '3600',
				upsert: false
			});

		if (error) {
			console.error('Supabase storage error:', error);
			return NextResponse.json(
				{ error: 'Failed to upload file' },
				{ status: 500 }
			);
		}

		// Get public URL
		const { data: { publicUrl } } = supabase.storage
			.from('talent-cvs')
			.getPublicUrl(storagePath);

		return NextResponse.json({
			cv_url: publicUrl,
			cv_filename: file.name,
			storage_path: storagePath
		});

	} catch (error) {
		console.error('CV upload error:', error);
		return NextResponse.json(
			{ error: 'An unexpected error occurred' },
			{ status: 500 }
		);
	}
}
