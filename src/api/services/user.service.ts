import { userApiSource } from "../../data-sources/ApiSource/userApiSource";
import { callApi } from "../core/apiClient";
import { UserLogin, UserRegister } from "../models/user.model";

export const userService = {
  postUserRegister(userRegister: UserRegister) {
    return userApiSource.postUserRegister(userRegister);
  },

  postUserLogin(UserLogin: UserLogin) {
    return userApiSource.getUserLogin(UserLogin);
  },

  getUserProfile(userId: string, token: string) {
    return callApi("getUserProfile", {
      pathParams: { userId },
      token,
    });
  },

  getInfoUserEdit(id: string) {
    return userApiSource.getInfoUserEdit(id);
  },
};
