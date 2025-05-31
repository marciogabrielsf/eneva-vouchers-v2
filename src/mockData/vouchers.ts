import { Voucher } from "../types";

export const mockVouchers: Voucher[] = [
    {
        id: "1",
        taxNumber: "TAX-000058",
        requestCode: "MAN-000063",
        date: "2023-10-14",
        value: 198.0,
        start: "Pecém II Geradora de Energia - São Gonçalo do Amarante",
        destination:
            "Avenida Contorno Leste, 687 - Novo Mondubim, Rua Granja Roquim, 08 - São Gonçalo Do Amarante",
    },
    {
        id: "2",
        taxNumber: "TAX-000059",
        requestCode: "DEL-000064",
        date: "2023-10-14",
        value: 198.0,
        start: "Shopping Iguatemi - Fortaleza",
        destination: "Rua B, 191 - Dendê",
    },
    {
        id: "3",
        taxNumber: "TAX-000060",
        requestCode: "TRN-000065",
        date: "2023-10-15",
        value: 320.5,
        start: "Aeroporto Internacional de Fortaleza",
        destination: "Hotel Gran Marquise - Fortaleza",
    },
    {
        id: "4",
        taxNumber: "TAX-000061",
        requestCode: "MAN-000066",
        date: "2023-10-16",
        value: 252.98,
        start: "Centro de Eventos do Ceará",
        destination: "Praia do Futuro - Fortaleza",
    },
    {
        id: "5",
        taxNumber: "TAX-000062",
        requestCode: "DEL-000067",
        date: "2023-10-17",
        value: 175.75,
        start: "Mercado Central - Fortaleza",
        destination: "Shopping RioMar - Fortaleza",
    },
    {
        id: "6",
        taxNumber: "TAX-000063",
        requestCode: "TRN-000068",
        date: "2023-10-18",
        value: 412.3,
        start: "Terminal Rodoviário Engenheiro João Thomé",
        destination: "Beach Park - Aquiraz",
    },
    {
        id: "7",
        taxNumber: "TAX-000064",
        requestCode: "MAN-000069",
        date: "2023-10-19",
        value: 289.45,
        start: "Universidade Federal do Ceará - Campus do Pici",
        destination: "Dragão do Mar Centro de Arte e Cultura",
    },
    {
        id: "8",
        taxNumber: "TAX-000065",
        requestCode: "DEL-000070",
        date: "2023-10-20",
        value: 155.6,
        start: "Hospital Regional Unimed",
        destination: "Parque Ecológico do Cocó",
    },
    {
        id: "9",
        taxNumber: "TAX-000066",
        requestCode: "TRN-000071",
        date: "2023-11-01",
        value: 347.8,
        start: "Estádio Castelão",
        destination: "Praia de Iracema - Fortaleza",
    },
    {
        id: "10",
        taxNumber: "TAX-000067",
        requestCode: "MAN-000072",
        date: "2023-11-02",
        value: 275.2,
        start: "Prefeitura de Fortaleza",
        destination: "Shopping Parangaba - Fortaleza",
    },
];

export const getTotalEarnings = (startDate?: Date, endDate?: Date): number => {
    if (!startDate || !endDate) {
        return mockVouchers.reduce((total, voucher) => total + voucher.value, 0);
    }

    return mockVouchers
        .filter((voucher) => {
            const voucherDate = new Date(voucher.date);
            return voucherDate >= startDate && voucherDate <= endDate;
        })
        .reduce((total, voucher) => total + voucher.value, 0);
};

export const getVouchersByMonth = (year: number, month: number): Voucher[] => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    return mockVouchers.filter((voucher) => {
        const voucherDate = new Date(voucher.date);
        return voucherDate >= startDate && voucherDate <= endDate;
    });
};

export const getCategoryBreakdown = (startDate?: Date, endDate?: Date): Record<string, number> => {
    const vouchersToAnalyze =
        startDate && endDate
            ? mockVouchers.filter((v) => {
                  const voucherDate = new Date(v.date);
                  return voucherDate >= startDate && voucherDate <= endDate;
              })
            : mockVouchers;

    return vouchersToAnalyze.reduce((acc, voucher) => {
        const category = voucher.requestCode.substring(0, 3);
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += voucher.value;
        return acc;
    }, {} as Record<string, number>);
};
