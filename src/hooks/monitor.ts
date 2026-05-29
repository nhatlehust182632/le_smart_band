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

    const getConfirmRequests = async (userId: string) => {
        if (loading) return;
        if (!userId) {
            throw new Error("Lỗi chức năng");
        }
        try {
            setLoading(true);
            const response = await monitorServices.getPendingRequests(userId);

            return response;
        } finally {
            setLoading(false);
        }
    };

    const getMonitorNotifications = async (userId: string) => {
        if (loading) return;
        if (!userId) {
            throw new Error("Lỗi chức năng");
        }
        try {
            setLoading(true);
            const response = await monitorServices.getPendingRequests(userId);

            return response;
        } finally {
            setLoading(false);
        }
    };

    const addMonitorByPhone = async (userId: string, phone: string) => {
        if (loading) return;
        if (!userId || !phone) {
            throw new Error("Lỗi chức năng");
        }
        try {
            setLoading(true);
            const response = await monitorServices.sendFollowRequestByPhone(userId, phone);

            return response;
        } finally {
            setLoading(false);
        }
    };

    const getUsersMonitoringMe = async (userId: string) => {
        if (loading) return;
        if (!userId) {
            throw new Error("Lỗi chức năng");
        }
        try {
            setLoading(true);
            const response = await monitorServices.getFollowers(userId);

            return response;
        } finally {
            setLoading(false);
        }
    };

    const stopMonitoring = async (userId: string, relationId: string) => {
        if (loading) return;
        if (!userId || !relationId) {
            throw new Error("Lỗi chức năng");
        }

        try {
            setLoading(true);
            const response = await monitorServices.cancelMonitoring(userId, relationId);
            return response;
        } finally {
            setLoading(false);
        }
    };

    const removeMonitorFromMe = async (userId: string, relationId: string) => {
        if (loading) return;
        if (!userId || !relationId) {
            throw new Error("Lỗi chức năng");
        }

        try {
            setLoading(true);
            const response = await monitorServices.cancelFollower(userId, relationId);
            return response;
        } finally {
            setLoading(false);
        }
    };

    const approveRequest = async (userId: string, requestId: string) => {
        if (loading) return;
        if (!userId || !requestId) {
            throw new Error("Lỗi chức năng");
        }
        try {
            setLoading(true);
            const response = await monitorServices.approveRequest(userId, requestId);

            return response;
        } finally {
            setLoading(false);
        }
    };

    return {
        getListMonitors,
        getMonitorId,
        getConfirmRequests,
        getMonitorNotifications,
        addMonitorByPhone,
        getUsersMonitoringMe,
        stopMonitoring,
        removeMonitorFromMe,
        approveRequest,
    };
}
