import { EarningsStatisticsResponse } from "../types";
import api from "./api";

// Service functions
export const statisticsService = {
    async getEarningsStatistics(params?: {
        from?: string; // YYYY-MM-DD
        to?: string; // YYYY-MM-DD
    }): Promise<EarningsStatisticsResponse> {
        const queryParams = new URLSearchParams();
        if (params?.from) queryParams.append("from", params.from);
        if (params?.to) queryParams.append("to", params.to);

        const queryString = queryParams.toString();
        const url = `/v2/voucher/statistics/earnings${queryString ? `?${queryString}` : ""}`;

        const response = await api.get<EarningsStatisticsResponse>(url);
        return response.data;
    },
};
