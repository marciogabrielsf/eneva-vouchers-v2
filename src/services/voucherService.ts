import api from "./api";
import {
    Voucher,
    VoucherPaginatedResponse,
    VoucherFiltersWithPagination,
    HomeSummaryResponse,
} from "../types";

export interface CreateVoucherData {
    taxNumber: string;
    requestCode: string;
    date: string;
    value: string | number;
    start: string;
    destination: string;
}

interface VoucherResponse {
    vouchers: Voucher[];
}

export interface UpdateVoucherData extends CreateVoucherData {}

export const voucherService = {
    // Create a new voucher
    createVoucher: async (voucherData: CreateVoucherData) => {
        try {
            const response = await api.post("/v2/voucher/create", voucherData);
            return response.data;
        } catch (error) {
            console.error("Error creating voucher:", error);
            throw error;
        }
    },

    // Get list of vouchers with pagination support
    getVouchers: async (filters?: VoucherFiltersWithPagination): Promise<Voucher[]> => {
        try {
            const params = new URLSearchParams();

            // Add pagination parameters
            params.append("offset", (filters?.offset || 0).toString());
            if (filters?.limit) {
                params.append("limit", filters.limit.toString());
            }

            // Add date filters
            if (filters?.from) {
                params.append("from", filters.from);
            }
            if (filters?.to) {
                params.append("to", filters.to);
            }

            const queryString = params.toString();
            const url = `/v2/voucher/getlist?${queryString}`;

            const response = await api.get<VoucherPaginatedResponse>(url);
            return response.data.vouchers;
        } catch (error: any) {
            // Treat 404 as "no data found" instead of error
            if (error.response?.status === 404) {
                console.log("No vouchers found for the specified criteria");
                return [];
            }
            console.error("Error getting vouchers:", error);
            if (error && typeof error === "object" && "response" in error) {
                console.log((error as any).response.data);
            }
            throw error;
        }
    },

    // Get paginated list of vouchers (returns full pagination info)
    getVouchersPaginated: async (
        filters?: VoucherFiltersWithPagination
    ): Promise<VoucherPaginatedResponse> => {
        try {
            const params = new URLSearchParams();

            // Add pagination parameters
            params.append("offset", (filters?.offset || 0).toString());
            if (filters?.limit) {
                params.append("limit", filters.limit.toString());
            }

            // Add date filters
            if (filters?.from) {
                params.append("from", filters.from);
            }
            if (filters?.to) {
                params.append("to", filters.to);
            }

            const queryString = params.toString();
            const url = `/v2/voucher/getlist?${queryString}`;

            const response = await api.get<VoucherPaginatedResponse>(url);
            return response.data;
        } catch (error) {
            console.error("Error getting vouchers:", error);
            if (error && typeof error === "object" && "response" in error) {
                console.log((error as any).response.data);
            }
            throw error;
        }
    },

    // Get recent vouchers for home screen (limit=5, offset=0)
    getRecentVouchers: async (): Promise<Voucher[]> => {
        try {
            const params = new URLSearchParams();
            params.append("offset", "0");
            params.append("limit", "5");

            const url = `/v2/voucher/getlist?${params.toString()}`;
            const response = await api.get<VoucherPaginatedResponse>(url);
            return response.data.vouchers;
        } catch (error: any) {
            // Treat 404 as "no data found" instead of error
            if (error.response?.status === 404) {
                console.log("No recent vouchers found");
                return [];
            }
            console.error("Error getting recent vouchers:", error);
            throw error;
        }
    },

    // Get home summary with 3 payment periods based on monthStartDay
    getHomeSummary: async (monthStartDay: number): Promise<HomeSummaryResponse> => {
        try {
            const params = new URLSearchParams();
            params.append("monthStartDay", monthStartDay.toString());

            const url = `/v2/voucher/home-summary?${params.toString()}`;
            const response = await api.get<HomeSummaryResponse>(url);
            return response.data;
        } catch (error: any) {
            // Treat 404 as "no data found" instead of error
            if (error.response?.status === 404) {
                console.log("No data found for home summary");
                return {
                    periods: [],
                    recentVouchers: [],
                };
            }
            console.error("Error getting home summary:", error);
            throw error;
        }
    },

    // Update a voucher
    updateVoucher: async (id: string, voucherData: UpdateVoucherData) => {
        try {
            const response = await api.put(`/v2/voucher/update/${id}`, voucherData);
            return response.data;
        } catch (error) {
            console.error("Error updating voucher:", error);
            throw error;
        }
    },

    // Delete a voucher
    deleteVoucher: async (id: string) => {
        try {
            const response = await api.delete(`/v2/voucher/delete/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting voucher:", error);
            throw error;
        }
    },
};

export default voucherService;
