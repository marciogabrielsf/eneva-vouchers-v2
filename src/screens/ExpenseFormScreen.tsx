import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { COLORS, FONTS, SIZES } from "../theme";
import { RootStackParamList, Expense, ExpenseCategory, CreateExpenseData } from "../types";
import { useExpenses } from "../context/ExpenseContext";
import { Picker } from "@react-native-picker/picker";

type ExpenseFormRouteProp = RouteProp<RootStackParamList, "ExpenseForm">;
type ExpenseFormNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExpenseFormScreen = () => {
    const navigation = useNavigation<ExpenseFormNavigationProp>();
    const route = useRoute<ExpenseFormRouteProp>();
    const { addExpense, updateExpense, getExpenseById, isLoading, error } = useExpenses();

    const expense = route.params?.expense;
    const isEditing = !!expense;

    const [value, setValue] = useState("");
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.OTHER);
    const [date, setDate] = useState(new Date());
    const [description, setDescription] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Category options for the picker
    const categoryOptions = [
        { label: "Alimentação", value: ExpenseCategory.FOOD },
        { label: "Transporte", value: ExpenseCategory.TRANSPORT },
        { label: "Moradia", value: ExpenseCategory.HOUSING },
        { label: "Entretenimento", value: ExpenseCategory.ENTERTAINMENT },
        { label: "Saúde", value: ExpenseCategory.HEALTHCARE },
        { label: "Educação", value: ExpenseCategory.EDUCATION },
        { label: "Utilidades", value: ExpenseCategory.UTILITIES },
        { label: "Compras", value: ExpenseCategory.SHOPPING },
        { label: "Outros", value: ExpenseCategory.OTHER },
    ];

    // Handle currency input with right-to-left input pattern
    const handleValueChange = (text: string) => {
        // Keep only digits
        const digits = text.replace(/\D/g, "");

        if (digits.length === 0) {
            setValue("");
            return;
        }

        // Convert to number for proper formatting (remove leading zeros)
        const valueInCents = parseInt(digits, 10);

        // Format as currency
        if (valueInCents < 10) {
            setValue(`R$ 0,0${valueInCents}`);
        } else if (valueInCents < 100) {
            setValue(`R$ 0,${valueInCents}`);
        } else {
            // Convert to string and separate whole and decimal parts
            const valueString = valueInCents.toString();
            const centsStr = valueString.slice(-2);
            const wholeStr = valueString.slice(0, -2) || "0";

            // Parse to number to remove leading zeros in the whole part
            const whole = parseInt(wholeStr, 10);

            // Format with thousand separators
            const formatted = whole.toLocaleString("pt-BR");
            setValue(`R$ ${formatted},${centsStr}`);
        }
    };

    // Format value for display (used when loading existing expense)
    const formatCurrency = (value: number) => {
        if (!value) return "";

        try {
            // Format using toLocaleString to get correct thousand separators
            return value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
            });
        } catch (e) {
            return "";
        }
    };

    useEffect(() => {
        if (isEditing && expense) {
            setValue(formatCurrency(expense.value));
            setCategory(expense.category);
            setDate(new Date(expense.date));
            setDescription(expense.description || "");
            setPaymentMethod(expense.paymentMethod || "");
        }
    }, [expense, isEditing]);

    // Show error alert if API call fails
    useEffect(() => {
        if (error && submitting) {
            Alert.alert("Erro", error);
            setSubmitting(false);
        }
    }, [error, submitting]);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === "ios");
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const showDatePickerModal = () => {
        setShowDatePicker(true);
    };

    const validateForm = () => {
        if (!value.trim()) {
            Alert.alert("Erro", "Valor é obrigatório");
            return false;
        }
        if (!category) {
            Alert.alert("Erro", "Categoria é obrigatória");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);

        try {
            // Parse the masked currency value by removing currency formatting
            let cleanValue = value
                .replace(/R\$\s?/g, "") // Remove R$ prefix
                .replace(/\./g, "") // Remove thousand separators
                .replace(",", ".") // Replace decimal comma with dot
                .trim();

            // Default to 0 if empty
            const numericValue = cleanValue ? parseFloat(cleanValue) : 0;

            // Validate the parsed value
            if (isNaN(numericValue) || numericValue <= 0) {
                Alert.alert("Erro", "Valor deve ser um número válido maior que zero");
                setSubmitting(false);
                return;
            }

            const expenseData: CreateExpenseData = {
                value: numericValue,
                category,
                date: format(date, "yyyy-MM-dd"),
                description: description.trim() || undefined,
                paymentMethod: paymentMethod.trim() || undefined,
            };

            if (isEditing && expense) {
                await updateExpense(expense.id, expenseData);
                Alert.alert("Sucesso", "Despesa atualizada com sucesso", [
                    { text: "OK", onPress: () => navigation.goBack() },
                ]);
            } else {
                await addExpense(expenseData);
                Alert.alert("Sucesso", "Despesa adicionada com sucesso", [
                    { text: "OK", onPress: () => navigation.goBack() },
                ]);
            }
        } catch (err) {
            // Error is handled by the useEffect that watches the error state
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView style={styles.container}>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Valor *</Text>
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={handleValueChange}
                        placeholder="R$ 0,00"
                        placeholderTextColor={COLORS.gray}
                        keyboardType="numeric"
                        editable={!isLoading && !submitting}
                    />

                    <Text style={styles.label}>Categoria *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={category}
                            onValueChange={(itemValue: ExpenseCategory) => setCategory(itemValue)}
                            style={styles.picker}
                            enabled={!isLoading && !submitting}
                        >
                            {categoryOptions.map((option) => (
                                <Picker.Item
                                    key={option.value}
                                    label={option.label}
                                    value={option.value}
                                />
                            ))}
                        </Picker>
                    </View>

                    <Text style={styles.label}>Data *</Text>
                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={showDatePickerModal}
                        disabled={isLoading || submitting}
                    >
                        <Text style={styles.dateText}>{format(date, "dd/MM/yyyy")}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}

                    <Text style={styles.label}>Descrição</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Descrição da despesa (opcional)"
                        placeholderTextColor={COLORS.gray}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        editable={!isLoading && !submitting}
                    />

                    <Text style={styles.label}>Método de Pagamento</Text>
                    <TextInput
                        style={styles.input}
                        value={paymentMethod}
                        onChangeText={setPaymentMethod}
                        placeholder="Ex: Cartão de crédito, PIX, Dinheiro (opcional)"
                        placeholderTextColor={COLORS.gray}
                        editable={!isLoading && !submitting}
                    />

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (isLoading || submitting) && styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={isLoading || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                {isEditing ? "Atualizar Despesa" : "Adicionar Despesa"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    formContainer: {
        padding: SIZES.padding,
    },
    label: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.text,
        marginBottom: SIZES.base,
        marginTop: SIZES.padding,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.text,
        backgroundColor: COLORS.white,
    },
    textArea: {
        height: 80,
        paddingTop: SIZES.padding,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.white,
        overflow: "hidden",
    },
    picker: {
        height: 50,
        color: COLORS.text,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        backgroundColor: COLORS.white,
        justifyContent: "center",
    },
    dateText: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.text,
    },
    submitButton: {
        backgroundColor: "#FF6B6B",
        borderRadius: SIZES.radius,
        padding: SIZES.padding * 1.5,
        alignItems: "center",
        marginTop: SIZES.padding * 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.gray,
    },
    submitButtonText: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: COLORS.white,
    },
});

export default ExpenseFormScreen;
