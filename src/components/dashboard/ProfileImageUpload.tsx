"use client";

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User as UserIcon, Camera, Loader2 } from "lucide-react";
import Image from "next/image";

interface ProfileImageUploadProps {
	currentImageUrl: string | null;
	talentName: string;
}

export function ProfileImageUpload({ currentImageUrl, talentName }: ProfileImageUploadProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const [isUploading, setIsUploading] = useState(false);
	const [imageUrl, setImageUrl] = useState(currentImageUrl);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Client-side validation
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			toast.error(t("dashboard.profileImage.errors.invalidType"));
			return;
		}

		const maxSize = 2 * 1024 * 1024; // 2MB
		if (file.size > maxSize) {
			toast.error(t("dashboard.profileImage.errors.tooLarge"));
			return;
		}

		// Upload image
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append('image', file);

			const response = await fetch('/api/upload-profile-image', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Upload failed');
			}

			const data = await response.json();
			setImageUrl(data.image_url);
			toast.success(t("dashboard.profileImage.success"));

			// Refresh the page to show updated image
			router.refresh();
		} catch (error) {
			console.error('Upload error:', error);
			toast.error(t("dashboard.profileImage.errors.uploadFailed"));
		} finally {
			setIsUploading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	return (
		<div className="relative group">
			<div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
				{imageUrl ? (
					<Image src={imageUrl} alt={talentName} width={96} height={96} className="object-cover w-full h-full" />
				) : (
					<UserIcon className="h-12 w-12 text-muted-foreground" />
				)}
			</div>

			{/* Hover overlay */}
			<button
				onClick={() => fileInputRef.current?.click()}
				disabled={isUploading}
				className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
			>
				{isUploading ? (
					<Loader2 className="h-6 w-6 text-white animate-spin" />
				) : (
					<div className="text-center">
						<Camera className="h-6 w-6 text-white mx-auto mb-1" />
						<span className="text-xs text-white font-medium">
							{imageUrl ? t("dashboard.profileImage.change") : t("dashboard.profileImage.upload")}
						</span>
					</div>
				)}
			</button>

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onChange={handleFileSelect}
				className="hidden"
			/>
		</div>
	);
}
