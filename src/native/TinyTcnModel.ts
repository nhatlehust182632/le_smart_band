import { NativeModules } from "react-native";

type TinyTcnModelResult = {
    logit: number;
    probability: number;
};

const { TinyTcnModel } = NativeModules;

export const runTinyTcnModel = async (
    ppgProcessed: number[],
    accProcessed: number[]
): Promise<TinyTcnModelResult> => {
    if (!TinyTcnModel) {
        throw new Error("TinyTcnModel native module is not available");
    }

    return TinyTcnModel.runModel(ppgProcessed, accProcessed);
};