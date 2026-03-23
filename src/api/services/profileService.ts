import {
  getProfileInfo,
  updateMyProfile
} from "@/data-sources/userSource";
import { User, UserId } from "../models/user.model";

export const profileService = {
  getProfileInfo(userId: UserId) {
    return getProfileInfo(userId);
  },
  updateMyProfile(user: User) {
    return updateMyProfile(user);
  },
};
