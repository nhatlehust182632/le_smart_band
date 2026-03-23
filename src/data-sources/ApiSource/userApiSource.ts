import { callApi } from "@/api";
import { mapUserLogin, mapUserRegister } from "@/api/mappers/user.mapper";
import { User, UserId, UserLogin, UserRegister } from "@/api/models/user.model";

export const userApiSource = {
  async postUserRegister(userRegister: UserRegister) {
    const rawData = await callApi("postUser", {
      body: { ...userRegister },
    });

    return mapUserRegister(rawData);
  },

  async getUserLogin(userLogin: UserLogin) {
    const id = userLogin?.id;
    const password_hash = userLogin?.password_hash;
    const rawData = await callApi("getUser", {
      // body: { ...userLogin },
      pathParams: { id, password_hash },
      query: userLogin,
    });

    return mapUserLogin(rawData);
  },

  async getProfileInfo(userId: UserId) {
    const id = userId?.id;
    const rawData = await callApi("getProfile", {
      pathParams: { id },
      query: userId,
    });

    return rawData;
  },

  async getInfoUserEdit(id: string) {
    const rawData = await callApi("getUserEdit", {
      pathParams: { id },
      query: { id: id },
    });

    return rawData;
  },

  async postInfoUserSave(user: User) {
    const rawData = await callApi("postUserSave", {
      body: user,
    });

    return rawData;
  },

  async updateMyProfile(user: User) {
    const id = user?.id;
    const rawData = await callApi("postUpdateProfile", {
      body: user,
      pathParams: { id },
      query: user,
    });

    return rawData;
  },

  async saveInfoUserEdit(userId: UserId) {
    const id = userId?.id;
    const rawData = await callApi("updateInfo", {
      pathParams: { id },
      query: userId,
    });

    return rawData;
  },
};
