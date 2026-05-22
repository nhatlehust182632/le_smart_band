import type {
    SensorFusionModelInput,
    Type5SlidingWindow,
    Type6SlidingWindow,
} from "../types/blePacket.types";

import { runTinyTcnModel } from "../../../native/TinyTcnModel";
import {
    preprocessSensorFusionSignals
} from "./sensorSignalProcessing";

const EXPECTED_SIGNAL_LENGTH = 1500;

export const createSensorFusionModelInput = (
    modelInputNo: number,
    type5Window: Type5SlidingWindow,
    type6Window: Type6SlidingWindow
): SensorFusionModelInput => {
    return {
        modelInputNo,
        type5WindowNo: type5Window.windowNo,
        type6WindowNo: type6Window.windowNo,
        xValues: type5Window.xValues,
        yValues: type5Window.yValues,
        zValues: type5Window.zValues,
        type6Values: type6Window.values,
        totalType5DataCountPerAxis: type5Window.totalDataCountPerAxis,
        totalType6DataCount: type6Window.totalDataCount,
    };
};

export const processSensorFusionModelDemo = async (
    input: SensorFusionModelInput
): Promise<number> => {
    console.log("[MODEL FUNCTION RECEIVED INPUT]", {
        modelInputNo: input.modelInputNo,
        arrayLengths: {
            type6: input.type6Values.length,
            type5x: input.xValues.length,
            type5y: input.yValues.length,
            type5z: input.zValues.length,
        },
    });

    /**
     * Log tổng hợp BLE thô.
     * Hiện tại comment lại để giảm nhiễu log.
     * Sau này cần debug quá trình nhận packet thì mở lại.
     */
    // console.log("[BLE TYPE SUMMARY]", {
    //     modelInputNo: input.modelInputNo,
    //     type5WindowNo: input.type5WindowNo,
    //     type6WindowNo: input.type6WindowNo,
    //     totalType5DataCountPerAxis: input.totalType5DataCountPerAxis,
    //     totalType6DataCount: input.totalType6DataCount,
    //     arrayLengths: {
    //         type6: input.type6Values.length,
    //         type5x: input.xValues.length,
    //         type5y: input.yValues.length,
    //         type5z: input.zValues.length,
    //     },
    // });

    if (input.type6Values.length === 0) {
        return 0;
    }

    /**
     * Giữ lại logic return cũ để tránh lỗi các file khác.
     * Các file khác hiện đang kỳ vọng processSensorFusionModelDemo trả về Promise<number>.
     */
    const type6Average =
        input.type6Values.reduce((sum, value) => sum + value, 0) /
        input.type6Values.length;

    const modelDemoResult = Number(type6Average.toFixed(2));

    const isFullSensorFusionInput =
        input.type6Values.length === EXPECTED_SIGNAL_LENGTH &&
        input.xValues.length === EXPECTED_SIGNAL_LENGTH &&
        input.yValues.length === EXPECTED_SIGNAL_LENGTH &&
        input.zValues.length === EXPECTED_SIGNAL_LENGTH;

    if (!isFullSensorFusionInput) {
        console.log("[MODEL PREPROCESS SKIPPED]", {
            reason: "Input arrays are not enough 1500 samples yet.",
            arrayLengths: {
                type6: input.type6Values.length,
                type5x: input.xValues.length,
                type5y: input.yValues.length,
                type5z: input.zValues.length,
            },
        });

        return modelDemoResult;
    }

    const {
        ppgProcessed,
        accProcessed,
    } = preprocessSensorFusionSignals(
        input.type6Values,
        input.xValues,
        input.yValues,
        input.zValues
    );

    const modelResult = await runTinyTcnModel(
        ppgProcessed,
        accProcessed
    );

    console.log("[MODEL COREML RESULT]", {
        modelInputNo: input.modelInputNo,
        logit: modelResult.logit,
        probability: modelResult.probability,
    });

    return Number(modelResult.probability.toFixed(4));

};
