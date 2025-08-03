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
import { Expense, ExpenseFilters, CreateExpenseData, CategorySummary } from "../types";
import expenseService from "../services/expenseService";
import { addHours, endOfDay, format, startOfDay } from "date-fns";
import { useSettings } from "./SettingsContext";

interface ExpenseContextData {
    expenses: Expense[];
    filteredExpenses: Expense[];
    totalExpenses: number;
    currentMonthDate: Date;
    categoryBreakdown: Record<string, number>;
    categorySummary: CategorySummary | null;
    isLoading: boolean;
    error: string | null;
    setCurrentMonthDate: (date: Date) => void;
    addExpense: (expense: CreateExpenseData) => Promise<void>;
    updateExpense: (id: string, expense: Partial<CreateExpenseData>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    getExpenseById: (id: string) => Expense | undefined;
    loadExpenses: (filters?: ExpenseFilters) => Promise<void>;
    loadCategorySummary: () => Promise<void>;
    getMonthRangeLabel: () => string;
    getExpensesByMonth: (month: number) => Expense[];
}

const ExpenseContext = createContext<ExpenseContextData>({} as ExpenseContextData);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
    const [categorySummary, setCategorySummary] = useState<CategorySummary | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { monthStartDay } = useSettings();

    // Use a ref to track if there's an ongoing request
    const isLoadingRef = useRef(false);

    // Calculate derived data
    const calculateTotalExpenses = (expenseList: Expense[]) => {
        return expenseList.reduce((total, expense) => total + expense.value, 0);
    };

    const calculateCategoryBreakdown = (expenseList: Expense[]) => {
        return expenseList.reduce((acc, expense) => {
            const category = expense.category;
            acc[category] = (acc[category] || 0) + expense.value;
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
        const formatOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
        return `${startDate.toLocaleDateString(
            "pt-BR",
            formatOptions
        )} - ${endDate.toLocaleDateString("pt-BR", formatOptions)}`;
    };

    const filteredExpenses = expenses
        .filter((expense) => {
            const expenseDate = new Date(expense.date);
            const { startDate, endDate } = getCustomMonthDateRange(currentMonthDate, monthStartDay);
            return expenseDate >= startDate && expenseDate <= endDate;
        })
        .sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime(); // Sort by date descending
        });

    const totalExpenses = useMemo(
        () => calculateTotalExpenses(filteredExpenses),
        [filteredExpenses]
    );
    const categoryBreakdown = useMemo(
        () => calculateCategoryBreakdown(filteredExpenses),
        [filteredExpenses]
    );

    // Load expenses
    const loadExpenses = useCallback(
        async (filters?: ExpenseFilters) => {
            // Use ref to track loading state to avoid dependency cycle
            if (isLoadingRef.current) return; // Prevent multiple simultaneous requests

            isLoadingRef.current = true;
            setIsLoading(true);
            setError(null);

            try {
                const { startDate, endDate } = getCustomMonthDateRange(
                    currentMonthDate,
                    monthStartDay
                );

                const expenseFilters = {
                    ...filters,
                    from: format(startDate, "yyyy-MM-dd"),
                    to: format(endDate, "yyyy-MM-dd"),
                    offset: 0,
                    // Don't set limit to get all expenses for the period (uses server default)
                };

                const response = await expenseService.getExpenses(expenseFilters);

                const expenses = response.map((expense) => {
                    return {
                        ...expense,
                        date: addHours(new Date(expense.date), 3).toISOString(),
                    };
                });

                setExpenses(expenses);
            } catch (err: any) {
                setError(err.message || "Failed to load expenses");
            } finally {
                setIsLoading(false);
                isLoadingRef.current = false;
            }
        },
        [currentMonthDate, monthStartDay]
    );

    // Load category summary
    const loadCategorySummary = useCallback(async () => {
        try {
            const { startDate, endDate } = getCustomMonthDateRange(currentMonthDate, monthStartDay);
            const summary = await expenseService.getCategorySummary({
                startDate: format(startDate, "yyyy-MM-dd"),
                endDate: format(endDate, "yyyy-MM-dd"),
            });
            setCategorySummary(summary);
        } catch (err: any) {
            console.error("Error loading category summary:", err);
        }
    }, [currentMonthDate, monthStartDay]);

    // Load expenses when the currentMonthDate changes or monthStartDay changes
    useEffect(() => {
        loadExpenses();
        loadCategorySummary();
    }, [monthStartDay, currentMonthDate]); // Add currentMonthDate as dependency

    const addExpense = async (expenseData: CreateExpenseData) => {
        setIsLoading(true);
        setError(null);

        try {
            // Format date to string if it's a Date object
            const formattedDate =
                typeof expenseData.date === "object" &&
                expenseData.date !== null &&
                "getMonth" in expenseData.date
                    ? format(expenseData.date as Date, "yyyy-MM-dd")
                    : expenseData.date;

            await expenseService.createExpense({
                ...expenseData,
                date: formattedDate,
            });

            // Reload expenses after adding
            await loadExpenses();
            await loadCategorySummary();
        } catch (err: any) {
            setError(err.message || "Failed to add expense");
            console.error("Error adding expense:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateExpense = async (id: string, expenseData: Partial<CreateExpenseData>) => {
        setIsLoading(true);
        setError(null);

        try {
            // Format date to string if it's a Date object
            const formattedData = { ...expenseData };
            if (
                formattedData.date &&
                typeof formattedData.date === "object" &&
                formattedData.date !== null &&
                "getMonth" in formattedData.date
            ) {
                formattedData.date = format(formattedData.date as Date, "yyyy-MM-dd");
            }

            await expenseService.updateExpense(id, formattedData);

            // Reload expenses after updating
            await loadExpenses();
            await loadCategorySummary();
        } catch (err: any) {
            setError(err.message || "Failed to update expense");
            console.error("Error updating expense:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteExpense = async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            await expenseService.deleteExpense(id);

            // Reload expenses after deleting
            await loadExpenses();
            await loadCategorySummary();
        } catch (err: any) {
            setError(err.message || "Failed to delete expense");
            console.error("Error deleting expense:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getExpenseById = (id: string): Expense | undefined => {
        return expenses.find((e) => e.id === id);
    };

    const getExpensesByMonth = (month: number) => {
        return expenses.filter((e) => new Date(e.date).getMonth() === month);
    };

    return (
        <ExpenseContext.Provider
            value={{
                expenses,
                totalExpenses,
                currentMonthDate,
                categoryBreakdown,
                categorySummary,
                isLoading,
                error,
                setCurrentMonthDate,
                addExpense,
                updateExpense,
                deleteExpense,
                getExpenseById,
                loadExpenses,
                loadCategorySummary,
                getMonthRangeLabel,
                getExpensesByMonth,
                filteredExpenses,
            }}
        >
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => useContext(ExpenseContext);

export default ExpenseContext;
