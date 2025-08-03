/**
 * Utility functions for formatting data
 */

/**
 * Formats a number as Brazilian currency
 */
export const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
};

/**
 * Formats a date to Brazilian format
 */
export const formatDateToBR = (date: Date): string => {
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

/**
 * Formats currency input with right-to-left pattern
 */
export const formatCurrencyInput = (text: string): string => {
    // Keep only digits
    const digits = text.replace(/\D/g, "");

    if (digits.length === 0) {
        return "";
    }

    // Convert to number for proper formatting (remove leading zeros)
    const valueInCents = parseInt(digits, 10);

    // Format as currency
    if (valueInCents < 10) {
        return `R$ 0,0${valueInCents}`;
    }

    if (valueInCents < 100) {
        return `R$ 0,${valueInCents}`;
    }

    // Convert to string and separate whole and decimal parts
    const valueString = valueInCents.toString();
    const centsStr = valueString.slice(-2);
    const wholeStr = valueString.slice(0, -2) || "0";

    // Parse to number to remove leading zeros in the whole part
    const whole = parseInt(wholeStr, 10);

    // Format with thousand separators
    const formatted = whole.toLocaleString("pt-BR");
    return `R$ ${formatted},${centsStr}`;
};

/**
 * Parses currency string to number
 */
export const parseCurrencyToNumber = (currencyString: string): number => {
    const cleanValue = currencyString
        .replace(/R\$\s?/g, "") // Remove R$ prefix
        .replace(/\./g, "") // Remove thousand separators
        .replace(",", ".") // Replace decimal comma with dot
        .trim();

    return cleanValue ? parseFloat(cleanValue) : 0;
};

/**
 * Formats a number value to currency display
 */
export const formatValueToCurrency = (value: number): string => {
    if (!value) return "";

    try {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
        });
    } catch (e) {
        return "";
    }
};
