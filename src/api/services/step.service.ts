import { callApi } from "../core/apiClient";

export const stepService = {
    async saveSteps(idUser: string, steps: string) {
        const body = { idUser, steps };

        const raw = await callApi("postSaveSteps", {
            body,
        });

        return raw;
    },
};
