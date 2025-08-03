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
import { RootStackParamList, Voucher } from "../types";
import { useVouchers } from "../context/VoucherContext";
import { validateForm } from "../utils/validators";
import {
    formatCurrencyInput,
    parseCurrencyToNumber,
    formatValueToCurrency,
} from "../utils/formatters";
import { useFormSubmission } from "../hooks/common";

type VoucherFormRouteProp = RouteProp<RootStackParamList, "VoucherForm">;
type VoucherFormNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const VoucherFormScreen = () => {
    const navigation = useNavigation<VoucherFormNavigationProp>();
    const route = useRoute<VoucherFormRouteProp>();
    const { addVoucher, updateVoucher, isLoading, error } = useVouchers();

    const voucher = route.params?.voucher;
    const isEditing = !!voucher;

    const [taxNumber, setTaxNumber] = useState("");
    const [requestCode, setRequestCode] = useState("");
    const [date, setDate] = useState(new Date());
    const [value, setValue] = useState("");
    const [start, setStart] = useState("");
    const [destination, setDestination] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Handle currency input with utility function
    const handleValueChange = useCallback((text: string) => {
        setValue(formatCurrencyInput(text));
    }, []);

    useEffect(() => {
        if (isEditing && voucher) {
            setTaxNumber(voucher.taxNumber);
            setRequestCode(voucher.requestCode);
            setDate(new Date(voucher.date));
            setValue(formatValueToCurrency(voucher.value));
            setStart(voucher.start);
            setDestination(voucher.destination);
        }
    }, [voucher, isEditing]);

    const performSubmit = useCallback(async () => {
        // Validate form fields
        if (!taxNumber.trim()) {
            Alert.alert("Erro", "Número fiscal é obrigatório");
            return;
        }
        if (!requestCode.trim()) {
            Alert.alert("Erro", "Código de solicitação é obrigatório");
            return;
        }
        if (!value.trim()) {
            Alert.alert("Erro", "Valor é obrigatório");
            return;
        }
        if (!start.trim()) {
            Alert.alert("Erro", "Local de origem é obrigatório");
            return;
        }
        if (!destination.trim()) {
            Alert.alert("Erro", "Destino é obrigatório");
            return;
        }

        const numericValue = parseCurrencyToNumber(value);

        // Validate the parsed value
        if (isNaN(numericValue)) {
            Alert.alert("Erro", "Valor deve ser um número válido");
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
    }, [
        taxNumber,
        requestCode,
        date,
        value,
        start,
        destination,
        isEditing,
        voucher,
        updateVoucher,
        addVoucher,
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
