import { locationService } from "@/api/services/location.service";
import { useState } from "react";

export function locationPlace() {
    const [loading, setLoading] = useState(false);

    const savePlaceNow = async (data: any) => {
        if (loading) return;
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

    const getListHistory = async (id: string) => {
        if (loading) return;
        if (!id) {
            throw new Error("Lỗi chức năng");
        }
        try {
            setLoading(true);
            const response = await locationService.getHistoryData(id);

            return response;
        } finally {
            setLoading(false);
        }
    };

    return {
        savePlaceNow,
        getListHistory
    };
}
