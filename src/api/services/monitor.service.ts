import { monitorSources } from "@/data-sources/monitorSource";

export const monitorServices = {
    getListMonitorByUser(id: string) {
        return monitorSources.getMonitorSourceByUser(id);
    },

    getMonitorIdDetailService(idMonitor: string) {
        return monitorSources.getMonitorIdDetailSoure(idMonitor);
    },

    getPendingRequests(id: string) {
        return monitorSources.getPendingRequests(id);
    },

    getFollowing(id: string) {
        return monitorSources.getFollowing(id);
    },

    getFollowers(id: string) {
        return monitorSources.getFollowers(id);
    },

    approveRequest(id: string, requestId: string) {
        return monitorSources.approveRequest(id, requestId);
    },

    sendFollowRequestByPhone(id: string, phone: string) {
        return monitorSources.sendFollowRequestByPhone({ id, phone });
    },
    cancelMonitoring(id: string, relationId: string) {
        return monitorSources.cancelMonitoring(id, relationId);
    },
    cancelFollower(id: string, relationId: string) {
        return monitorSources.cancelFollower(id, relationId);
    },
};
