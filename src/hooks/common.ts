/**
 * Common hooks for screens with similar functionality
 */

import { useState, useRef, useEffect } from "react";
import { Animated } from "react-native";

/**
 * Hook for managing loading states and preventing multiple API calls
 */
export const useLoadingState = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const initialLoadDone = useRef(false);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const setLoadingState = (loading: boolean) => {
        if (isMounted.current) {
            setIsLoading(loading);
        }
    };

    const setRefreshingState = (refreshing: boolean) => {
        if (isMounted.current) {
            setRefreshing(refreshing);
        }
    };

    return {
        isLoading,
        refreshing,
        initialLoadDone,
        isMounted,
        setLoadingState,
        setRefreshingState,
    };
};

/**
 * Hook for screen entrance animations
 */
export const useScreenAnimation = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    const startAnimation = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return {
        fadeAnim,
        slideAnim,
        startAnimation,
        animatedStyle: {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
        },
    };
};

/**
 * Hook for form submission handling
 */
export const useFormSubmission = (onSubmit: () => Promise<void>) => {
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (submitting) return;

        setSubmitting(true);
        try {
            await onSubmit();
        } finally {
            setSubmitting(false);
        }
    };

    return {
        submitting,
        handleSubmit,
    };
};
