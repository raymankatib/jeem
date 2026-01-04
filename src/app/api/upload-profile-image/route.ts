import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
	try {
		// Check authentication
		const supabase = await createServerSupabaseClient();
		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get('image') as File;

		if (!file) {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 });
		}

		// Validate file type
		if (!ALLOWED_TYPES.includes(file.type)) {
			return NextResponse.json(
				{ error: 'Only JPG, PNG, and WebP images are allowed' },
				{ status: 400 }
			);
		}

		// Validate file size
		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 });
		}

		// Generate unique filename
		const timestamp = Date.now();
		const randomStr = Math.random().toString(36).substring(7);
		const extension = file.name.split('.').pop() || 'jpg';
		const uniqueFilename = `${timestamp}-${randomStr}.${extension}`;

		// Create path structure: user_id/filename
		const storagePath = `${user.id}/${uniqueFilename}`;

		// Convert File to ArrayBuffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Upload to Supabase Storage
		const supabaseAdmin = getSupabaseAdmin();
		const { data, error } = await supabaseAdmin.storage.from('talent-profile-images').upload(storagePath, buffer, {
			contentType: file.type,
			cacheControl: '3600',
			upsert: true // Allow replacing existing images
		});

		if (error) {
			console.error('Supabase storage error:', error);
			return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
		}

		// Get public URL (no signed URL needed - public bucket)
		const {
			data: { publicUrl }
		} = supabaseAdmin.storage.from('talent-profile-images').getPublicUrl(storagePath);

		// Update talents table with new image URL
		const { error: updateError } = await supabaseAdmin
			.from('talents')
			.update({
				image_url: publicUrl,
				image_filename: file.name
			})
			.eq('email', user.email);

		if (updateError) {
			console.error('Database update error:', updateError);
			return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
		}

		return NextResponse.json({
			image_url: publicUrl,
			image_filename: file.name,
			storage_path: storagePath
		});
	} catch (error) {
		console.error('Profile image upload error:', error);
		return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
}
