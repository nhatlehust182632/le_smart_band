// import notifee, { AndroidImportance } from "@notifee/react-native";
import notifee, {
    AndroidImportance,
    AuthorizationStatus,
} from "@notifee/react-native";
import { Platform } from "react-native";

export const requestNotificationPermission = async () => {
    try {
        const settings = await notifee.requestPermission();

        console.log("[NOTIFICATION PERMISSION]", {
            authorizationStatus: settings.authorizationStatus,
        });

        const isGranted =
            settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
            settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

        if (!isGranted) {
            console.log("[NOTIFICATION PERMISSION DENIED]");
            return false;
        }

        if (Platform.OS === "android") {
            await notifee.createChannel({
                id: "health_alerts",
                name: "Cảnh báo sức khỏe",
                importance: AndroidImportance.HIGH,
            });

            console.log("[NOTIFICATION CHANNEL CREATED]");
        }

        return true;
    } catch (error) {
        console.log("[REQUEST NOTIFICATION PERMISSION ERROR]", error);
        return false;
    }
};

// export const requestNotificationPermission = async () => {
//     await notifee.requestPermission();
// };

export const showAtrialFibrillationNotification = async (params?: {
    thresholdValue?: number | string | null;
}) => {
    const channelId = await notifee.createChannel({
        id: "health_alerts",
        name: "Cảnh báo sức khỏe",
        importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
        title: "Cảnh báo rung nhĩ",
        body: params?.thresholdValue
            ? `Hệ thống AI phát hiện dấu hiệu bất thường. Giá trị: ${params.thresholdValue}`
            : "Hệ thống AI phát hiện dấu hiệu nhịp tim bất thường.",
        android: {
            channelId,
            pressAction: {
                id: "default",
            },
        },
        ios: {
            foregroundPresentationOptions: {
                alert: true,
                badge: true,
                sound: true,
            },
        },
    });
};

export const showBatteryStatusNotification = async (params: {
    batteryPercent: number;
    batteryTemperatureC?: number | null;
}) => {
    const channelId = await notifee.createChannel({
        id: "device_alerts",
        name: "Cảnh báo thiết bị",
        importance: AndroidImportance.HIGH,
    });

    const temperatureText =
        typeof params.batteryTemperatureC === "number"
            ? `${params.batteryTemperatureC}°F (${params.batteryTemperatureC - 273}°C)`
            : "Không có dữ liệu";

    await notifee.displayNotification({
        title: "Thông báo pin",
        body: `Pin: ${params.batteryPercent}% - Nhiệt độ pin: ${temperatureText}`,
        android: {
            channelId,
            pressAction: {
                id: "default",
            },
        },
        ios: {
            foregroundPresentationOptions: {
                alert: true,
                badge: true,
                sound: true,
            },
        },
    });
};

export const showChargingStatusNotification = async (params: {
    isCharging: boolean;
}) => {
    const channelId = await notifee.createChannel({
        id: "device_alerts",
        name: "Cảnh báo thiết bị",
        importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
        title: "Thông báo trạng thái sạc",
        body: params.isCharging
            ? "Thiết bị đang sạc."
            : "Thiết bị đã ngắt sạc/không sạc.",
        android: {
            channelId,
            pressAction: {
                id: "default",
            },
        },
        ios: {
            foregroundPresentationOptions: {
                alert: true,
                badge: true,
                sound: true,
            },
        },
    });
};

export const showDisconnectNotification = async (params?: {
    title?: string;
    body?: string;
}) => {
    const channelId = await notifee.createChannel({
        id: "device_alerts",
        name: "Cảnh báo thiết bị",
        importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
        title: params?.title || "Mất kết nối",
        body: params?.body || "Thiết bị vòng tay đã bị mất kết nối.",
        android: {
            channelId,
            pressAction: {
                id: "default",
            },
        },
        ios: {
            foregroundPresentationOptions: {
                alert: true,
                badge: true,
                sound: true,
            },
        },
    });
};