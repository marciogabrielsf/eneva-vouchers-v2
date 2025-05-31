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
import { RootStackParamList, Voucher } from "../types";
import { useVouchers } from "../context/VoucherContext";

type VoucherFormRouteProp = RouteProp<RootStackParamList, "VoucherForm">;
type VoucherFormNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const VoucherFormScreen = () => {
    const navigation = useNavigation<VoucherFormNavigationProp>();
    const route = useRoute<VoucherFormRouteProp>();
    const { addVoucher, updateVoucher, getVoucherById, isLoading, error } = useVouchers();

    const voucher = route.params?.voucher;
    const isEditing = !!voucher;

    const [taxNumber, setTaxNumber] = useState("");
    const [requestCode, setRequestCode] = useState("");
    const [date, setDate] = useState(new Date());
    const [value, setValue] = useState("");
    const [start, setStart] = useState("");
    const [destination, setDestination] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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

    // Format value for display (used when loading existing voucher)
    const formatCurrency = (value: string) => {
        if (!value) return "";

        try {
            // Convert string to number
            const numericValue = parseFloat(value.replace(",", "."));
            if (isNaN(numericValue)) return "";

            // Format using toLocaleString to get correct thousand separators
            return numericValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
            });
        } catch (e) {
            return "";
        }
    };

    useEffect(() => {
        if (isEditing && voucher) {
            setTaxNumber(voucher.taxNumber);
            setRequestCode(voucher.requestCode);
            setDate(new Date(voucher.date));
            setValue(formatCurrency(voucher.value.toString()));
            setStart(voucher.start);
            setDestination(voucher.destination);
        }
    }, [voucher, isEditing]);

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
        if (!taxNumber.trim()) {
            Alert.alert("Erro", "Número fiscal é obrigatório");
            return false;
        }
        if (!requestCode.trim()) {
            Alert.alert("Erro", "Código de solicitação é obrigatório");
            return false;
        }
        if (!value.trim()) {
            Alert.alert("Erro", "Valor é obrigatório");
            return false;
        }
        if (!start.trim()) {
            Alert.alert("Erro", "Local de origem é obrigatório");
            return false;
        }
        if (!destination.trim()) {
            Alert.alert("Erro", "Destino é obrigatório");
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
            if (isNaN(numericValue)) {
                Alert.alert("Erro", "Valor deve ser um número válido");
                setSubmitting(false);
                return;
            }

            const voucherData: Omit<Voucher, "id"> = {
                taxNumber,
                requestCode,
                date: format(date, "yyyy-MM-dd"),
                value: numericValue,
                start,
                destination,
            };

            if (isEditing && voucher) {
                await updateVoucher(voucher.id, voucherData);
                Alert.alert("Sucesso", "Voucher atualizado com sucesso", [
                    { text: "OK", onPress: () => navigation.goBack() },
                ]);
            } else {
                await addVoucher(voucherData);
                Alert.alert("Sucesso", "Voucher adicionado com sucesso", [
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
                    <Text style={styles.label}>Número Fiscal</Text>
                    <TextInput
                        style={styles.input}
                        value={taxNumber}
                        onChangeText={setTaxNumber}
                        placeholder="Ex: TAX-000058"
                        placeholderTextColor={COLORS.gray}
                        editable={!isLoading && !submitting}
                    />

                    <Text style={styles.label}>Código de Solicitação</Text>
                    <TextInput
                        style={styles.input}
                        value={requestCode}
                        onChangeText={setRequestCode}
                        placeholder="Ex: MAN-000063"
                        placeholderTextColor={COLORS.gray}
                        editable={!isLoading && !submitting}
                    />

                    <Text style={styles.label}>Data</Text>
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

                    <Text style={styles.label}>Valor</Text>
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={handleValueChange}
                        placeholder="R$ 0,00"
                        placeholderTextColor={COLORS.gray}
                        keyboardType="numeric"
                        editable={!isLoading && !submitting}
                    />

                    <Text style={styles.label}>Local de Origem</Text>
                    <TextInput
                        style={styles.textArea}
                        value={start}
                        onChangeText={setStart}
                        placeholder="Digite o local de origem"
                        placeholderTextColor={COLORS.gray}
                        multiline
                        numberOfLines={3}
                        editable={!isLoading && !submitting}
                    />

                    <Text style={styles.label}>Destino</Text>
                    <TextInput
                        style={styles.textArea}
                        value={destination}
                        onChangeText={setDestination}
                        placeholder="Digite o destino"
                        placeholderTextColor={COLORS.gray}
                        multiline
                        numberOfLines={3}
                        editable={!isLoading && !submitting}
                    />

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (isLoading || submitting) && styles.disabledButton,
                        ]}
                        onPress={handleSubmit}
                        disabled={isLoading || submitting}
                    >
                        {isLoading || submitting ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                {isEditing ? "Atualizar Voucher" : "Adicionar Voucher"}
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
        color: COLORS.black,
        marginBottom: SIZES.base,
        marginTop: SIZES.padding,
    },
    input: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.black,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    dateInput: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    dateText: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.black,
    },
    textArea: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.black,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        minHeight: 100,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: COLORS.black,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        alignItems: "center",
        marginTop: SIZES.padding * 2,
        marginBottom: SIZES.padding,
    },
    disabledButton: {
        backgroundColor: COLORS.gray,
    },
    submitButtonText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.white,
    },
});

export default VoucherFormScreen;
