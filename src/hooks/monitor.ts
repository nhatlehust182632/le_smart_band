import { monitorServices } from "@/api/services/monitor.service";
import { useState } from "react";

export function monitorHook() {
    const [loading, setLoading] = useState(false);

    const getListMonitors = async (id: string) => {
        if (loading) return;
        if (!id) {
            throw new Error("Lỗi chức năng");
        }
        try {
            setLoading(true);
            const response = await monitorServices.getListMonitorByUser(id);

            return response;
        } finally {
            setLoading(false);
        }
    };

    const getMonitorId = async (idMonitor: string) => {
        if (loading) return;
        if (!idMonitor) {
            throw new Error("Lỗi chức năng");
        }
        try {
            setLoading(true);
            const response = await monitorServices.getMonitorIdDetailService(idMonitor);

            return response;
        } finally {
            setLoading(false);
        }
    };

    return {
        getListMonitors,
        getMonitorId
    };
}
