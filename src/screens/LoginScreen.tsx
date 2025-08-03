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

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

const LoginScreen = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const { login, isLoading, error } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const performLogin = useCallback(async () => {
        const validationError = validateForm([
            { value: email, name: "Email", validator: validateEmail },
            { value: password, name: "Senha" },
        ]);

        if (validationError) {
            Alert.alert("Erro", validationError);
            return;
        }

        await login({ email, password });
    }, [email, password, login]);

    const { submitting, handleSubmit } = useFormSubmission(performLogin);

    // Show error alert if API call fails
    useEffect(() => {
        if (error && submitting) {
            Alert.alert("Erro", error);
        }
    }, [error, submitting]);

    const handleRegister = useCallback(() => {
        navigation.navigate("Register");
    }, [navigation]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.logoContainer}>
                    {/* Replace with your actual logo */}
                    <Text style={styles.logoText}>ENEVA</Text>
                    <Text style={styles.subtitle}>Vouchers</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.title}>Login</Text>

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
                            <Text style={styles.buttonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Não tem uma conta? </Text>
                        <TouchableOpacity onPress={handleRegister}>
                            <Text style={styles.registerLink}>Cadastre-se</Text>
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
    logoContainer: {
        alignItems: "center",
        marginBottom: SIZES.padding * 2,
    },
    logoText: {
        ...FONTS.bold,
        fontSize: SIZES.xxxlarge,
        color: COLORS.black,
    },
    subtitle: {
        ...FONTS.medium,
        fontSize: SIZES.large,
        color: COLORS.gray,
        marginTop: -SIZES.base,
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
    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: SIZES.padding,
    },
    registerText: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.gray,
    },
    registerLink: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.black,
    },
});

export default LoginScreen;
