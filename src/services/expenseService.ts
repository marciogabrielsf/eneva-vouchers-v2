import api from "./api";
import {
    Expense,
    CreateExpenseData,
    ExpenseFilters,
    CategorySummary,
    ExpensePaginatedResponse,
    ExpenseFiltersWithPagination,
} from "../types";

export interface UpdateExpenseData extends Partial<CreateExpenseData> {}

interface ExpenseResponse {
    expenses: Expense[];
}

interface ExpenseDetailResponse {
    expense: Expense;
}

export const expenseService = {
    // Create a new expense
    createExpense: async (expenseData: CreateExpenseData) => {
        try {
            const response = await api.post("/expense/create", expenseData);
            return response.data;
        } catch (error) {
            console.error("Error creating expense:", error);
            throw error;
        }
    },

    // Get list of expenses with pagination support
    getExpenses: async (filters?: ExpenseFiltersWithPagination): Promise<Expense[]> => {
        try {
            const params = new URLSearchParams();

            // Add pagination parameters
            params.append("offset", (filters?.offset || 0).toString());
            if (filters?.limit) {
                params.append("limit", filters.limit.toString());
            }

            // Add date filters (prefer 'from'/'to' over 'startDate'/'endDate')
            if (filters?.from) {
                params.append("from", filters.from);
            } else if (filters?.startDate) {
                params.append("startDate", filters.startDate);
            }

            if (filters?.to) {
                params.append("to", filters.to);
            } else if (filters?.endDate) {
                params.append("endDate", filters.endDate);
            }

            // Add category filter
            if (filters?.category) {
                params.append("category", filters.category);
            }

            const queryString = params.toString();
            const url = `/expense/getlist?${queryString}`;

            const response = await api.get<ExpensePaginatedResponse>(url);
            return response.data.expenses;
        } catch (error: any) {
            // Treat 404 as "no data found" instead of error
            if (error.response?.status === 404) {
                console.log("No expenses found for the specified criteria");
                return [];
            }
            console.error("Error getting expenses:", error);
            if (error && typeof error === "object" && "response" in error) {
                console.log((error as any).response.data);
            }
            throw error;
        }
    },

    // Get paginated list of expenses (returns full pagination info)
    getExpensesPaginated: async (
        filters?: ExpenseFiltersWithPagination
    ): Promise<ExpensePaginatedResponse> => {
        try {
            const params = new URLSearchParams();

            // Add pagination parameters
            params.append("offset", (filters?.offset || 0).toString());
            if (filters?.limit) {
                params.append("limit", filters.limit.toString());
            }

            // Add date filters (prefer 'from'/'to' over 'startDate'/'endDate')
            if (filters?.from) {
                params.append("from", filters.from);
            } else if (filters?.startDate) {
                params.append("startDate", filters.startDate);
            }

            if (filters?.to) {
                params.append("to", filters.to);
            } else if (filters?.endDate) {
                params.append("endDate", filters.endDate);
            }

            // Add category filter
            if (filters?.category) {
                params.append("category", filters.category);
            }

            const queryString = params.toString();
            const url = `/expense/getlist?${queryString}`;

            const response = await api.get<ExpensePaginatedResponse>(url);
            return response.data;
        } catch (error) {
            console.error("Error getting expenses:", error);
            if (error && typeof error === "object" && "response" in error) {
                console.log((error as any).response.data);
            }
            throw error;
        }
    },

    // Get recent expenses for home screen (limit=5, offset=0)
    getRecentExpenses: async (): Promise<Expense[]> => {
        try {
            const params = new URLSearchParams();
            params.append("offset", "0");
            params.append("limit", "5");

            const url = `/expense/getlist?${params.toString()}`;
            const response = await api.get<ExpensePaginatedResponse>(url);
            return response.data.expenses;
        } catch (error) {
            console.error("Error getting recent expenses:", error);
            throw error;
        }
    },

    // Get expense by ID
    getExpenseById: async (id: string) => {
        try {
            const response = await api.get<ExpenseDetailResponse>(`/expense/${id}`);
            return response.data.expense;
        } catch (error) {
            console.error("Error getting expense by ID:", error);
            throw error;
        }
    },

    // Update an expense
    updateExpense: async (id: string, expenseData: UpdateExpenseData) => {
        try {
            const response = await api.put(`/expense/update/${id}`, expenseData);
            return response.data;
        } catch (error) {
            console.error("Error updating expense:", error);
            throw error;
        }
    },

    // Delete an expense
    deleteExpense: async (id: string) => {
        try {
            const response = await api.delete(`/expense/delete/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting expense:", error);
            throw error;
        }
    },

    // Get category summary
    getCategorySummary: async (filters?: { startDate?: string; endDate?: string }) => {
        try {
            const params = new URLSearchParams();

            if (filters?.startDate) {
                params.append("startDate", filters.startDate);
            }
            if (filters?.endDate) {
                params.append("endDate", filters.endDate);
            }

            const queryString = params.toString();
            const url = queryString
                ? `/expense/summary/categories?${queryString}`
                : "/expense/summary/categories";

            const response = await api.get<CategorySummary>(url);
            return response.data;
        } catch (error: any) {
            // Treat 404 as "no data found" instead of error
            if (error.response?.status === 404) {
                console.log("No expenses found for category summary");
                return { summary: {}, total: 0 };
            }
            console.error("Error getting category summary:", error);
            throw error;
        }
    },
};

export default expenseService;
