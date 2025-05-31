import api from "./api";
import { Voucher } from "../types";

export interface CreateVoucherData {
    taxNumber: string;
    requestCode: string;
    date: string;
    value: string | number;
    start: string;
    destination: string;
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

    // Get list of vouchers
    getVouchers: async () => {
        try {
            const response = await api.get("/v2/voucher/getlist");
            return response.data.vouchers;
        } catch (error) {
            console.error("Error getting vouchers:", error);
            console.log(error.response.data);
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
