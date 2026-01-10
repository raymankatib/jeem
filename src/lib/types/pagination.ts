export interface PaginationParams {
	page: number; // 1-based page number
	pageSize: number; // items per page
}

export interface PaginationInfo {
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: PaginationInfo;
}


