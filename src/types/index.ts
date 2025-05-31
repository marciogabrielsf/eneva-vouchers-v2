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
