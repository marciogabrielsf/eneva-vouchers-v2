import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { SettingsProvider } from "./src/context/SettingsContext";
import AppNavigator from "./src/navigation/AppNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";
import { COLORS } from "./src/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, View } from "react-native";
import "react-native-gesture-handler";

// Create a client for React Query
const queryClient = new QueryClient();

// Main navigation component that decides which navigator to show based on auth state
const NavigationRouter = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: COLORS.background,
                }}
            >
                <ActivityIndicator size="large" color={COLORS.black} />
            </View>
        );
    }

    return <>{isAuthenticated ? <AppNavigator /> : <AuthNavigator />}</>;
};

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SettingsProvider>
                    <NavigationContainer>
                        <NavigationRouter />
                    </NavigationContainer>
                </SettingsProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
