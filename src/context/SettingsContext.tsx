import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsContextData {
    discountPercentage: number;
    monthStartDay: number;
    setDiscountPercentage: (value: number) => Promise<void>;
    setMonthStartDay: (day: number) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextData>({} as SettingsContextData);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [discountPercentage, setDiscountPercentageState] = useState<number>(0.15);
    const [monthStartDay, setMonthStartDayState] = useState<number>(1);

    // Load settings from AsyncStorage on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const storedPercentage = await AsyncStorage.getItem("@settings_discountPercentage");
                if (storedPercentage !== null) {
                    setDiscountPercentageState(parseFloat(storedPercentage));
                }

                const storedMonthStartDay = await AsyncStorage.getItem("@settings_monthStartDay");
                if (storedMonthStartDay !== null) {
                    setMonthStartDayState(parseInt(storedMonthStartDay));
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            }
        };

        loadSettings();
    }, []);

    // Update discount percentage and save to AsyncStorage
    const setDiscountPercentage = async (value: number) => {
        try {
            await AsyncStorage.setItem("@settings_discountPercentage", value.toString());
            setDiscountPercentageState(value);
        } catch (error) {
            console.error("Error saving discount percentage:", error);
        }
    };

    // Update month start day and save to AsyncStorage
    const setMonthStartDay = async (day: number) => {
        try {
            await AsyncStorage.setItem("@settings_monthStartDay", day.toString());
            setMonthStartDayState(day);
        } catch (error) {
            console.error("Error saving month start day:", error);
        }
    };

    return (
        <SettingsContext.Provider
            value={{
                discountPercentage,
                monthStartDay,
                setDiscountPercentage,
                setMonthStartDay,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);

export default SettingsContext;
