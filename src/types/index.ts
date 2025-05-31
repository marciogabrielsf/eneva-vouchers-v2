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
    Statistics: undefined;
    VoucherForm: { voucher?: Voucher };
    VoucherDetails: { id: string };
    Login: undefined;
    Register: undefined;
};

export type BottomTabParamList = {
    HomeTab: undefined;
    VouchersTab: undefined;
    StatisticsTab: undefined;
    SettingsTab: undefined;
};
