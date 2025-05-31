import { useState, useEffect } from "react";
import { EarningsStatisticsResponse } from "../types";
import { statisticsService } from "../services/statisticsService";

export const useEarningsStatistics = (startDate?: Date, endDate?: Date) => {
    const [data, setData] = useState<EarningsStatisticsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params: { from?: string; to?: string } = {};

            if (startDate) {
                params.from = startDate.toISOString().split("T")[0];
            }
            if (endDate) {
                params.to = endDate.toISOString().split("T")[0];
            }

            const response = await statisticsService.getEarningsStatistics(params);
            setData(response);
        } catch (err) {
            console.error("Error fetching earnings statistics:", err);
            setError("Erro ao carregar estatísticas de ganhos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const refetch = () => {
        fetchData();
    };

    return {
        data,
        loading,
        error,
        refetch,
    };
};

export default useEarningsStatistics;
