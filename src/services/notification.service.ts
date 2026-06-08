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