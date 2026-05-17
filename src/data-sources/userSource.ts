import { ENV_DATA } from "@/constants/env";
import { userApiSource } from "./ApiSource/userApiSource";
import { userMockSource } from "./MockSource/userMockSource";

// export const postUserRegister = ENV_DATA.USE_USER_REGISTER
//   ? userApiSource.postUserRegister
//   : userMockSource.postUserRegister;

// export const getUserLogin = ENV_DATA.USE_USER_LOGIN
//   ? userApiSource.getUserLogin
//   : userMockSource.getUserLogin;

export const getProfileInfo = ENV_DATA.USE_USER_LOGIN
  ? userApiSource.getProfileInfo
  : userMockSource.getUserLogin;

export const updateMyProfile = ENV_DATA.USE_USER_LOGIN
  ? userApiSource.updateMyProfile
  : userMockSource.getUserLogin;

// export const getInfoUserEdit = ENV_DATA.USE_USER_LOGIN
//   ? userApiSource.getInfoUserEdit
//   : userMockSource.getUserLogin;

// export const postInfoUserSave = ENV_DATA.USE_USER_LOGIN
//   ? userApiSource.postInfoUserSave
//   : userMockSource.getUserLogin;
