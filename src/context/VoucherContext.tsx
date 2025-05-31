import React, {
    createContext,
    useState,
    useContext,
    ReactNode,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import { Voucher, VoucherListParams } from "../types";
import voucherService from "../services/voucherService";
import { addHours, endOfDay, format, startOfDay } from "date-fns";
import { useSettings } from "./SettingsContext";

interface VoucherContextData {
    vouchers: Voucher[];
    filteredVouchers: Voucher[];
    totalEarnings: number;
    currentMonthDate: Date;
    categoryBreakdown: Record<string, number>;
    isLoading: boolean;
    error: string | null;
    setCurrentMonthDate: (date: Date) => void;
    addVoucher: (voucher: Omit<Voucher, "id">) => Promise<void>;
    updateVoucher: (id: string, voucher: Partial<Voucher>) => Promise<void>;
    deleteVoucher: (id: string) => Promise<void>;
    getVoucherById: (id: string) => Voucher | undefined;
    loadVouchers: (params?: VoucherListParams) => Promise<void>;
    getMonthRangeLabel: () => string;
    getVouchersByMonth: (month: number) => Voucher[];
}

const VoucherContext = createContext<VoucherContextData>({} as VoucherContextData);

export const VoucherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { monthStartDay } = useSettings();

    // Use a ref to track if there's an ongoing request
    const isLoadingRef = useRef(false);

    // Calculate derived data
    const calculateTotalEarnings = (voucherList: Voucher[]) => {
        return voucherList.reduce((total, voucher) => total + voucher.value, 0);
    };

    const calculateCategoryBreakdown = (voucherList: Voucher[]) => {
        return voucherList.reduce((acc, voucher) => {
            const category = voucher.requestCode.substring(0, 3);
            acc[category] = (acc[category] || 0) + voucher.value;
            return acc;
        }, {} as Record<string, number>);
    };

    // Helper function to get start and end dates based on currentMonthDate and monthStartDay
    const getCustomMonthDateRange = (date: Date, startDay: number) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        // Create start date with specified start day
        const startDate = startOfDay(new Date(year, month, startDay));

        // If current date is earlier than the start day in the current month,
        // we need to get the range from previous month's start day to current month's start day
        if (date.getDate() < startDay) {
            startDate.setMonth(month - 1);
        }

        // End date is one month after start date, but same day
        const endDate = endOfDay(new Date(startDate));
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1); // Subtract one day to get the end of the period

        return { startDate, endDate };
    };

    // Get a human-readable label for the current custom month range
    const getMonthRangeLabel = () => {
        const { startDate, endDate } = getCustomMonthDateRange(currentMonthDate, monthStartDay);
        const formatOptions = { month: "short", day: "numeric" };
        return `${startDate.toLocaleDateString(
            "pt-BR",
            formatOptions
        )} - ${endDate.toLocaleDateString("pt-BR", formatOptions)}`;
    };

    const filteredVouchers = vouchers
        .filter((voucher) => {
            const voucherDate = new Date(voucher.date);
            const { startDate, endDate } = getCustomMonthDateRange(currentMonthDate, monthStartDay);
            return voucherDate >= startDate && voucherDate <= endDate;
        })
        .sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime(); // Sort by date descending
        });

    const totalEarnings = useMemo(
        () => calculateTotalEarnings(filteredVouchers),
        [filteredVouchers]
    );
    const categoryBreakdown = useMemo(
        () => calculateCategoryBreakdown(filteredVouchers),
        [filteredVouchers]
    );

    // Wrap loadVouchers with useCallback to prevent it from being recreated on every render
    // CRITICAL: Remove isLoading from dependencies to break the circular dependency
    const loadVouchers = useCallback(
        async (params?: VoucherListParams) => {
            // Use ref to track loading state to avoid dependency cycle
            if (isLoadingRef.current) return; // Prevent multiple simultaneous requests

            isLoadingRef.current = true;
            setIsLoading(true);
            setError(null);

            try {
                const response = await voucherService.getVouchers();

                const vouchers = response.map((voucher) => {
                    return {
                        ...voucher,
                        date: addHours(new Date(voucher.date), 3).toISOString(),
                    };
                });

                setVouchers(vouchers);
            } catch (err: any) {
                setError(err.message || "Failed to load vouchers");
                console.error("Error loading vouchers:", err);
            } finally {
                setIsLoading(false);
                isLoadingRef.current = false;
            }
        },
        [currentMonthDate, monthStartDay]
    );

    // Load vouchers when the currentMonthDate changes or monthStartDay changes
    // CRITICAL: Don't add loadVouchers as a dependency to avoid infinite loop
    useEffect(() => {
        // This will use the most recent version of loadVouchers
        // but won't re-run when loadVouchers changes
        loadVouchers();
    }, [monthStartDay]); // Add monthStartDay as dependency

    const addVoucher = async (voucherData: Omit<Voucher, "id">) => {
        setIsLoading(true);
        setError(null);

        try {
            // Format date to string if it's a Date object
            const formattedDate =
                typeof voucherData.date === "object" &&
                voucherData.date !== null &&
                "getMonth" in voucherData.date
                    ? format(voucherData.date as Date, "yyyy-MM-dd")
                    : voucherData.date;

            // Format value to string if it's a number
            const formattedValue =
                typeof voucherData.value === "number"
                    ? voucherData.value.toString().replace(".", ",")
                    : voucherData.value;

            await voucherService.createVoucher({
                ...voucherData,
                date: formattedDate,
                value: formattedValue,
            });

            // Reload vouchers after adding
            await loadVouchers();
        } catch (err: any) {
            setError(err.message || "Failed to add voucher");
            console.error("Error adding voucher:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateVoucher = async (id: string, voucherData: Partial<Voucher>) => {
        setIsLoading(true);
        setError(null);

        try {
            // Format date to string if it's a Date object
            const formattedData = { ...voucherData };
            if (
                formattedData.date &&
                typeof formattedData.date === "object" &&
                formattedData.date !== null &&
                "getMonth" in formattedData.date
            ) {
                formattedData.date = format(formattedData.date as Date, "yyyy-MM-dd");
            }

            // Format value to string if it's a number
            if (formattedData.value && typeof formattedData.value === "number") {
                formattedData.value = formattedData.value.toString().replace(".", ",");
            }

            await voucherService.updateVoucher(id, formattedData);

            // Reload vouchers after updating
            await loadVouchers();
        } catch (err: any) {
            setError(err.message || "Failed to update voucher");
            console.error("Error updating voucher:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteVoucher = async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            await voucherService.deleteVoucher(id);

            // Reload vouchers after deleting
            await loadVouchers();
        } catch (err: any) {
            setError(err.message || "Failed to delete voucher");
            console.error("Error deleting voucher:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getVoucherById = (id: string): Voucher | undefined => {
        return vouchers.find((v) => v.id === id);
    };

    const getVouchersByMonth = (month: number) => {
        return vouchers.filter((v) => new Date(v.date).getMonth() === month);
    };
    return (
        <VoucherContext.Provider
            value={{
                vouchers,
                totalEarnings,
                currentMonthDate,
                categoryBreakdown,
                isLoading,
                error,
                setCurrentMonthDate,
                addVoucher,
                updateVoucher,
                deleteVoucher,
                getVoucherById,
                loadVouchers,
                getMonthRangeLabel,
                getVouchersByMonth,
                filteredVouchers,
            }}
        >
            {children}
        </VoucherContext.Provider>
    );
};

export const useVouchers = () => useContext(VoucherContext);

export default VoucherContext;
