"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface FilterConfig {
	key: string;
	labelKey: string;
	options: { value: string; labelKey: string }[];
}

interface FilterBarProps {
	filters: Record<string, string>;
	onFilterChange: (filterKey: string, value: string) => void;
	onClearFilters: () => void;
	filterConfig: FilterConfig[];
}

export function FilterBar({ filters, onFilterChange, onClearFilters, filterConfig }: FilterBarProps) {
	const { t } = useTranslation();

	const hasActiveFilters = Object.values(filters).some((v) => v !== "all");

	return (
		<div className="mb-6 p-4 border rounded-lg bg-muted/30">
			<div className="flex items-center gap-3 flex-wrap">
				<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
					<Filter className="h-4 w-4" />
					<span>{t("dashboard.filters.label")}</span>
				</div>

				<div className="flex items-center gap-2 flex-wrap flex-1">
					{filterConfig.map((config) => (
						<Select
							key={config.key}
							value={filters[config.key] || "all"}
							onValueChange={(value) => onFilterChange(config.key, value)}
						>
							<SelectTrigger className="w-full sm:w-[200px] bg-background">
								<SelectValue placeholder={t(config.labelKey)} />
							</SelectTrigger>
							<SelectContent>
								{config.options.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.labelKey.startsWith("dashboard.") || option.labelKey.startsWith("applicationForm.")
											? t(option.labelKey)
											: option.labelKey}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					))}
				</div>

				{hasActiveFilters && (
					<Button variant="outline" size="sm" onClick={onClearFilters} className="h-9 ms-auto">
						<X className="h-4 w-4 me-1" />
						{t("dashboard.filters.clear")}
					</Button>
				)}
			</div>
		</div>
	);
}
