import React, { useState, useEffect, useCallback } from "react";
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
import { COLORS, FONTS, SIZES } from "../theme";
import { RootStackParamList, Expense, ExpenseCategory, CreateExpenseData } from "../types";
import { useExpenses } from "../context/ExpenseContext";
import { Picker } from "@react-native-picker/picker";
import {
    formatCurrencyInput,
    parseCurrencyToNumber,
    formatValueToCurrency,
} from "../utils/formatters";
import { useFormSubmission } from "../hooks/common";

type ExpenseFormRouteProp = RouteProp<RootStackParamList, "ExpenseForm">;
type ExpenseFormNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExpenseFormScreen = () => {
    const navigation = useNavigation<ExpenseFormNavigationProp>();
    const route = useRoute<ExpenseFormRouteProp>();
    const { addExpense, updateExpense, isLoading, error } = useExpenses();

    const expense = route.params?.expense;
    const isEditing = !!expense;

    const [value, setValue] = useState("");
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.OTHER);
    const [date, setDate] = useState(new Date());
    const [description, setDescription] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);

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

    // Handle currency input with utility function
    const handleValueChange = useCallback((text: string) => {
        setValue(formatCurrencyInput(text));
    }, []);

    useEffect(() => {
        if (isEditing && expense) {
            setValue(formatValueToCurrency(expense.value));
            setCategory(expense.category);
            setDate(new Date(expense.date));
            setDescription(expense.description || "");
            setPaymentMethod(expense.paymentMethod || "");
        }
    }, [expense, isEditing]);

    const performSubmit = useCallback(async () => {
        if (!value.trim()) {
            Alert.alert("Erro", "Valor é obrigatório");
            return;
        }
        if (!category) {
            Alert.alert("Erro", "Categoria é obrigatória");
            return;
        }

        const numericValue = parseCurrencyToNumber(value);

        // Validate the parsed value
        if (isNaN(numericValue) || numericValue <= 0) {
            Alert.alert("Erro", "Valor deve ser um número válido maior que zero");
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
    }, [
        value,
        category,
        date,
        description,
        paymentMethod,
        isEditing,
        expense,
        updateExpense,
        addExpense,
        navigation,
    ]);

    const { submitting, handleSubmit } = useFormSubmission(performSubmit);

    // Show error alert if API call fails
    useEffect(() => {
        if (error && submitting) {
            Alert.alert("Erro", error);
        }
    }, [error, submitting]);

    const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === "ios");
        if (selectedDate) {
            setDate(selectedDate);
        }
    }, []);

    const showDatePickerModal = useCallback(() => {
        setShowDatePicker(true);
    }, []);

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
