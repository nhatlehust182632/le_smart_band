import { monitorSources } from "@/data-sources/monitorSource";

export const monitorServices = {
    getListMonitorByUser(id: string) {
        return monitorSources.getMonitorSourceByUser(id);
    },

    getMonitorIdDetailService(idMonitor: string) {
        return monitorSources.getMonitorIdDetailSoure(idMonitor);
    },

    getMonitorConfirmRequests(userId: string) {
        return monitorSources.getMonitorConfirmRequests(userId);
    },

    getMonitorNotifications(userId: string) {
        return monitorSources.getMonitorNotifications(userId);
    },

    getUsersMonitoringMe(userId: string) {
        return monitorSources.getUsersMonitoringMe(userId);
    },

    stopMonitoring(userId: string, monitoredId: string) {
        return monitorSources.stopMonitoring(userId, monitoredId);
    },

    removeMonitorFromMe(userId: string, monitorId: string) {
        return monitorSources.removeMonitorFromMe(userId, monitorId);
    },

    addMonitorByPhone(userId: string, phone: string) {
        return monitorSources.addMonitorByPhone({ userId, phone });
    },
};
