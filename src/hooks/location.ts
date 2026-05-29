import { locationService } from "@/api/services/location.service";
import { useState } from "react";

export function locationPlace() {
    const [loading, setLoading] = useState(false);

    const savePlaceNow = async (data: any) => {
        if (!data) {
            throw new Error("Lỗi chức năng");
        }

        try {
            setLoading(true);
            const response = await locationService.saveLocationPlace(data);
            return response;
        } finally {
            setLoading(false);
        }
    };

    const getListHistory = async (id: string, days: number) => {
        if (!id) {
            throw new Error("Lỗi chức năng");
        }

        try {
            setLoading(true);
            const response = await locationService.getHistoryData(id, days);

            console.log("GET LIST HISTORY RESPONSE =>", response);

            return response;
        } finally {
            setLoading(false);
        }
    };

    const getTopLocation = async (id: string, days: number) => {
        if (!id) {
            throw new Error("Lỗi chức năng");
        }

        try {
            setLoading(true);
            const response = await locationService.getTopLocationData(id, days);

            return response;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        savePlaceNow,
        getListHistory,
        getTopLocation,
    };
}