"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	totalCount: number;
	pageSize: number;
	onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, totalCount, pageSize, onPageChange }: PaginationProps) {
	const { t } = useTranslation();

	if (totalPages <= 1) return null;

	const startItem = (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, totalCount);

	return (
		<div className="flex items-center justify-between px-2 py-4">
			<p className="text-sm text-muted-foreground">
				{t("pagination.showing", { start: startItem, end: endItem, total: totalCount })}
			</p>
			<div className="flex items-center gap-2">
				<Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
					<ChevronLeft className="h-4 w-4 rtl:rotate-180" />
					{t("pagination.previous")}
				</Button>
				<span className="text-sm text-muted-foreground px-2">
					{t("pagination.pageOf", { current: currentPage, total: totalPages })}
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
				>
					{t("pagination.next")}
					<ChevronRight className="h-4 w-4 rtl:rotate-180" />
				</Button>
			</div>
		</div>
	);
}
