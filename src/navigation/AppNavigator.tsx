import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootStackParamList, BottomTabParamList } from "../types";
import HomeScreen from "../screens/HomeScreen";
import VouchersScreen from "../screens/VouchersScreen";

import { COLORS } from "../theme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import StatisticsScreen from "../screens/StatisticsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import VoucherFormScreen from "../screens/VoucherFormScreen";
import VoucherDetailsScreen from "../screens/VoucherDetailsScreen";
import { useAuth } from "../context/AuthContext";
import { VoucherProvider } from "../context/VoucherContext";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: COLORS.black,
                tabBarInactiveTintColor: COLORS.gray,
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    borderTopWidth: 0,
                    elevation: 5,
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarLabel: "Início",
                    tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="VouchersTab"
                component={VouchersScreen}
                options={{
                    tabBarLabel: "Vouchers",
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="receipt" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="StatisticsTab"
                component={StatisticsScreen}
                options={{
                    tabBarLabel: "Estatísticas",
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="chart-pie" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsScreen}
                options={{
                    tabBarLabel: "Configurações",
                    tabBarIcon: ({ color, size }) => <Icon name="cog" color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <VoucherProvider>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: COLORS.white,
                    },
                    headerTintColor: COLORS.black,
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                    contentStyle: {
                        backgroundColor: COLORS.background,
                    },
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={BottomTabNavigator}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Vouchers"
                    component={VouchersScreen}
                    options={{ title: "Vouchers" }}
                />
                <Stack.Screen
                    name="Statistics"
                    component={StatisticsScreen}
                    options={{ title: "Estatísticas" }}
                />
                <Stack.Screen
                    name="VoucherForm"
                    component={VoucherFormScreen}
                    options={({ route }) => ({
                        title: route.params?.voucher ? "Editar Voucher" : "Adicionar Voucher",
                    })}
                />
                <Stack.Screen
                    name="VoucherDetails"
                    component={VoucherDetailsScreen}
                    options={{ title: "Detalhes do Voucher" }}
                />
            </Stack.Navigator>
        </VoucherProvider>
    );
};

export default AppNavigator;
