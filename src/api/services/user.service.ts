import { callApi } from "../core/apiClient";

export const userService = {
  getUserProfile(userId: string, token: string) {
    return callApi("getUserProfile", {
      pathParams: { userId },
      token,
    });
  },
};
