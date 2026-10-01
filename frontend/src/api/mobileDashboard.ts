const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "VITE_API_BASE_URL is not defined"
  );
}

export type MobileFilterOptions = {
  date_range: {
    min_date: string | null;
    max_date: string | null;
  };

  duration: {
    default: number;
    operator: string;
  };
};


export type MobileSummary = {
  start_date: string | null;
  end_date: string | null;

  min_duration: number;

  most_common_cld: string | null;
  most_common_cld_count: number;

  total_calls: number;
  unique_cli: number;

  total_duration_seconds: number;
  total_duration_minutes: number;

  total_cost: number;
};


export type MobileCall = {
  id: number;

  connect_time: string;

  cli: string | null;
  cld: string | null;

  prefix: string | null;

  billed_duration: number | null;
  result: number | null;
  cost: number | null;

  remote_ip: string | null;
  access_list: string | null;
};


export type MobileCallsResponse = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;

  items: MobileCall[];
};


export type MobileDashboardFilters = {
  startDate?: string;
  endDate?: string;

  minDuration?: number;

  page?: number;
  pageSize?: number;
};


function buildQuery(
  filters: MobileDashboardFilters,
) {
  const params = new URLSearchParams();

  if (filters.startDate) {
    params.set(
      "start_date",
      filters.startDate,
    );
  }

  if (filters.endDate) {
    params.set(
      "end_date",
      filters.endDate,
    );
  }

  if (
    filters.minDuration !== undefined
  ) {
    params.set(
      "min_duration",
      filters.minDuration.toString(),
    );
  }

  if (filters.page !== undefined) {
    params.set(
      "page",
      filters.page.toString(),
    );
  }

  if (
    filters.pageSize !== undefined
  ) {
    params.set(
      "page_size",
      filters.pageSize.toString(),
    );
  }

  return params.toString();
}


export async function fetchMobileFilterOptions():
  Promise<MobileFilterOptions> {

  const response = await fetch(
    `${API_BASE_URL}/api/mobile-dashboard/filter-options`,
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load mobile filter options",
    );
  }

  return response.json();
}


export async function fetchMobileSummary(
  filters: MobileDashboardFilters,
): Promise<MobileSummary> {

  const query = buildQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
    minDuration: filters.minDuration,
  });

  const response = await fetch(
    `${API_BASE_URL}/api/mobile-dashboard/summary?${query}`,
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load mobile dashboard summary",
    );
  }

  return response.json();
}


export async function fetchMobileCalls(
  filters: MobileDashboardFilters,
): Promise<MobileCallsResponse> {

  const query = buildQuery(filters);

  const response = await fetch(
    `${API_BASE_URL}/api/mobile-dashboard/calls?${query}`,
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load mobile calls",
    );
  }

  return response.json();
}