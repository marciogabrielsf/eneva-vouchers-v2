import React, { useState, useEffect } from "react";
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
    Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS, FONTS, SIZES } from "../theme";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../types";

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

const LoginScreen = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const { login, isLoading, error } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Show error alert if API call fails
    useEffect(() => {
        if (error && submitting) {
            Alert.alert("Erro", error);
            setSubmitting(false);
        }
    }, [error, submitting]);

    const validateForm = () => {
        if (!email.trim()) {
            Alert.alert("Erro", "Email é obrigatório");
            return false;
        }
        if (!password.trim()) {
            Alert.alert("Erro", "Senha é obrigatória");
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            await login({ email, password });
            // No need to navigate - App.tsx will handle routing based on auth state
        } catch (err) {
            // Error is handled by the useEffect that watches the error state
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegister = () => {
        navigation.navigate("Register");
    };

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
                        onPress={handleLogin}
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
