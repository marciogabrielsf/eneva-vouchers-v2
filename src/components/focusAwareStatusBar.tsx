import React from "react";
import { View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { StatusBar, StatusBarProps } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FocusAwareStatusBarProps extends Omit<StatusBarProps, "backgroundColor"> {
    backgroundColor?: string;
}

export function FocusAwareStatusBar({ backgroundColor, ...props }: FocusAwareStatusBarProps) {
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();

    if (!isFocused) {
        return null;
    }

    return (
        <>
            {backgroundColor && (
                <View
                    style={{
                        height: insets.top,
                        backgroundColor: backgroundColor,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                    }}
                />
            )}
            <StatusBar {...props} />
        </>
    );
}
