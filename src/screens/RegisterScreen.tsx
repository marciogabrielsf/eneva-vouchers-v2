import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS, FONTS, SIZES } from "../theme";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../types";
import { validateForm, validateEmail } from "../utils/validators";
import { useFormSubmission } from "../hooks/common";

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Register">;

const RegisterScreen = () => {
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const { register, isLoading, error } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Format CPF as user types: XXX.XXX.XXX-XX
    const formatCPF = useCallback((text: string) => {
        // Remove all non-numeric characters
        const cleaned = text.replace(/\D/g, "");

        // Apply the mask
        let formatted = cleaned;
        if (cleaned.length > 3) {
            formatted = cleaned.substring(0, 3) + "." + cleaned.substring(3);
        }
        if (cleaned.length > 6) {
            formatted = formatted.substring(0, 7) + "." + cleaned.substring(7);
        }
        if (cleaned.length > 9) {
            formatted = formatted.substring(0, 11) + "-" + cleaned.substring(11);
        }

        // Limit to CPF length (11 digits + formatting)
        if (cleaned.length > 11) {
            formatted = formatted.substring(0, 14);
        }

        return formatted;
    }, []);

    const handleCPFChange = useCallback(
        (text: string) => {
            setCpf(formatCPF(text));
        },
        [formatCPF]
    );

    const performRegister = useCallback(async () => {
        // Validate all fields
        if (!name.trim()) {
            Alert.alert("Erro", "Nome é obrigatório");
            return;
        }

        const emailError = validateEmail(email);
        if (emailError) {
            Alert.alert("Erro", emailError);
            return;
        }

        if (!cpf.trim()) {
            Alert.alert("Erro", "CPF é obrigatório");
            return;
        }

        if (!password.trim()) {
            Alert.alert("Erro", "Senha é obrigatória");
            return;
        }

        if (!confirmPassword.trim()) {
            Alert.alert("Erro", "Confirmação de senha é obrigatória");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Erro", "As senhas não coincidem");
            return;
        }

        await register({
            name,
            email,
            cpf,
            password,
            confirmpassword: confirmPassword,
        });

        Alert.alert("Sucesso", "Cadastro realizado com sucesso! Faça login com suas credenciais.", [
            { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
    }, [name, email, cpf, password, confirmPassword, register, navigation]);

    const { submitting, handleSubmit } = useFormSubmission(performRegister);

    // Show error alert if API call fails
    useEffect(() => {
        if (error && submitting) {
            Alert.alert("Erro", error);
        }
    }, [error, submitting]);

    const handleBackToLogin = useCallback(() => {
        navigation.navigate("Login");
    }, [navigation]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Criar Conta</Text>

                    <Text style={styles.label}>Nome</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Seu nome completo"
                        placeholderTextColor={COLORS.gray}
                        editable={!isLoading && !submitting}
                    />

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="seu@email.com"
                        placeholderTextColor={COLORS.gray}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading && !submitting}
                    />

                    <Text style={styles.label}>CPF</Text>
                    <TextInput
                        style={styles.input}
                        value={cpf}
                        onChangeText={handleCPFChange}
                        placeholder="000.000.000-00"
                        placeholderTextColor={COLORS.gray}
                        keyboardType="numeric"
                        editable={!isLoading && !submitting}
                    />

                    <Text style={styles.label}>Senha</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Sua senha"
                        placeholderTextColor={COLORS.gray}
                        secureTextEntry
                        editable={!isLoading && !submitting}
                    />

                    <Text style={styles.label}>Confirmar Senha</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirme sua senha"
                        placeholderTextColor={COLORS.gray}
                        secureTextEntry
                        editable={!isLoading && !submitting}
                    />

                    <TouchableOpacity
                        style={[
                            styles.buttonPrimary,
                            (isLoading || submitting) && styles.disabledButton,
                        ]}
                        onPress={handleSubmit}
                        disabled={isLoading || submitting}
                    >
                        {isLoading || submitting ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                            <Text style={styles.buttonText}>Cadastrar</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Já tem uma conta? </Text>
                        <TouchableOpacity onPress={handleBackToLogin}>
                            <Text style={styles.loginLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: COLORS.background,
        padding: SIZES.padding,
        justifyContent: "center",
    },
    formContainer: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding * 1.5,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        ...FONTS.bold,
        fontSize: SIZES.xxlarge,
        color: COLORS.black,
        marginBottom: SIZES.padding,
    },
    label: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.black,
        marginBottom: SIZES.base,
        marginTop: SIZES.padding,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.black,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    buttonPrimary: {
        backgroundColor: COLORS.black,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        alignItems: "center",
        marginTop: SIZES.padding * 2,
    },
    disabledButton: {
        backgroundColor: COLORS.gray,
    },
    buttonText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.white,
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: SIZES.padding,
    },
    loginText: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.gray,
    },
    loginLink: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.black,
    },
});

export default RegisterScreen;
