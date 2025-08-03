/**
 * Validation utility functions
 */

/**
 * Validates form data with common rules
 */
export const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value.trim()) {
        return `${fieldName} é obrigatório`;
    }
    return null;
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Email deve ter um formato válido";
    }
    return null;
};

/**
 * Validates numeric value
 */
export const validateNumericValue = (value: string, min = 0): string | null => {
    const numericValue = parseFloat(value.replace(",", "."));

    if (isNaN(numericValue)) {
        return "Valor deve ser um número válido";
    }

    if (numericValue < min) {
        return `Valor deve ser maior que ${min}`;
    }

    return null;
};

/**
 * Validates form with multiple fields
 */
export const validateForm = (
    fields: Array<{ value: string; name: string; validator?: (value: string) => string | null }>
): string | null => {
    for (const field of fields) {
        const error = validateRequired(field.value, field.name);
        if (error) return error;

        if (field.validator) {
            const customError = field.validator(field.value);
            if (customError) return customError;
        }
    }
    return null;
};
