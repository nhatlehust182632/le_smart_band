import {
  getInfoUserEdit,
  getUserLogin,
  postUserRegister,
} from "@/data-sources/userSource";
import { callApi } from "../core/apiClient";
import { UserLogin, UserRegister } from "../models/user.model";

export const userService = {
  postUserRegister(userRegister: UserRegister) {
    return postUserRegister(userRegister);
  },

  postUserLogin(UserLogin: UserLogin) {
    return getUserLogin(UserLogin);
  },

  getUserProfile(userId: string, token: string) {
    return callApi("getUserProfile", {
      pathParams: { userId },
      token,
    });
  },

  getInfoUserEdit(id: string) {
    return getInfoUserEdit(id);
  },
};
