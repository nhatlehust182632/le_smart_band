import { monitorSources } from "@/data-sources/monitorSource";

export const monitorServices = {
    getListMonitorByUser(id: string) {
        return monitorSources.getMonitorSourceByUser(id);
    },

    getMonitorIdDetailService(idMonitor: string) {
        return monitorSources.getMonitorIdDetailSoure(idMonitor);
    },
};
