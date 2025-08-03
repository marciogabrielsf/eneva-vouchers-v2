export interface Voucher {
    id: string;
    taxNumber: string;
    requestCode: string;
    date: string;
    value: number;
    start: string;
    destination: string;
    category?: string; // Derived from requestCode (first 3 letters)
}

export interface VoucherListParams {
    startDate: Date;
    endDate: Date;
    page?: number;
    limit?: number;
}

export interface EarningsStatisticsData {
    date: string; // YYYY-MM-DD
    value: number; // Soma dos valores dos vouchers neste intervalo
    count: number; // Quantidade de vouchers neste intervalo
}

export interface EarningsStatisticsResponse {
    data: EarningsStatisticsData[];
    summary: {
        totalEarnings: number; // Total de ganhos no período
        voucherCount: number; // Total de vouchers no período
        period: {
            from: string; // Data de início (YYYY-MM-DD)
            to: string; // Data de fim (YYYY-MM-DD)
        };
        intervalDays: number; // Quantos dias cada ponto do gráfico representa
    };
}

export type RootStackParamList = {
    Home: undefined;
    Vouchers: undefined;
    Expenses: undefined;
    Statistics: undefined;
    VoucherForm: { voucher?: Voucher };
    VoucherDetails: { id: string };
    ExpenseForm: { expense?: Expense };
    ExpenseDetails: { id: string };
    Login: undefined;
    Register: undefined;
};

export type BottomTabParamList = {
    HomeTab: undefined;
    VouchersTab: undefined;
    ExpensesTab: undefined;
    StatisticsTab: undefined;
    SettingsTab: undefined;
};

// Expense types
export interface Expense {
    id: string;
    value: number;
    category: ExpenseCategory;
    date: string;
    description?: string;
    paymentMethod?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export enum ExpenseCategory {
    FOOD = "FOOD",
    TRANSPORT = "TRANSPORT",
    HOUSING = "HOUSING",
    ENTERTAINMENT = "ENTERTAINMENT",
    HEALTHCARE = "HEALTHCARE",
    EDUCATION = "EDUCATION",
    UTILITIES = "UTILITIES",
    SHOPPING = "SHOPPING",
    OTHER = "OTHER",
}

export interface CreateExpenseData {
    value: number;
    category: ExpenseCategory;
    date: string;
    description?: string;
    paymentMethod?: string;
}

export interface ExpenseFilters {
    category?: ExpenseCategory;
    startDate?: string;
    endDate?: string;
}

export interface CategorySummary {
    summary: Record<string, number>;
    total: number;
}

// Pagination types
export interface PaginationInfo {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    offset: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}

// API specific response structures
export interface VoucherPaginatedResponse {
    vouchers: Voucher[];
    pagination: PaginationInfo;
}

export interface ExpensePaginatedResponse {
    expenses: Expense[];
    pagination: PaginationInfo;
}

export interface PaginationParams {
    offset?: number;
    limit?: number;
}

export interface ExpenseFiltersWithPagination extends ExpenseFilters, PaginationParams {
    from?: string; // YYYY-MM-DD (preferred over startDate)
    to?: string; // YYYY-MM-DD (preferred over endDate)
}

export interface VoucherFiltersWithPagination extends PaginationParams {
    from?: string; // YYYY-MM-DD
    to?: string; // YYYY-MM-DD
}

// Home screen specific types
export interface HomeSummaryPeriod {
    title: string;
    dateRange: string;
    value: number;
    monthOffset: number; // -2, -1, 0 (relative to current period)
}

export interface HomeSummaryResponse {
    periods: HomeSummaryPeriod[];
    recentVouchers: Voucher[];
}
