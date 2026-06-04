import { ENV_DATA } from "@/constants/env";
import { userApiSource } from "./ApiSource/userApiSource";
import { userMockSource } from "./MockSource/userMockSource";

export const getProfileInfo = ENV_DATA.USE_USER_LOGIN
  ? userApiSource.getProfileInfo
  : userMockSource.getUserLogin;

export const updateMyProfile = ENV_DATA.USE_USER_LOGIN
  ? userApiSource.postInfoUserSave
  : userMockSource.getUserLogin;
