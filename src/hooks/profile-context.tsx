import { Profile, User } from "@/api/models/user.model";
import { useAuth } from "@/context/AuthContext";
import { userApiSource } from "@/data-sources/ApiSource/userApiSource";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ProfileContextType = {
  loading: boolean;
  profile: Profile | null;
  profileDetail: any | null;
  refreshProfileData: () => Promise<void>;
  saveProfileDetail: (payload: User) => Promise<any>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileDetail, setProfileDetail] = useState<any | null>(null);

  const refreshProfileData = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setProfileDetail(null);
      return;
    }

    try {
      setLoading(true);
      const [profileResp, detailResp] = await Promise.all([
        userApiSource.getProfileInfo({ id: user.id, password_hash: "" }),
        userApiSource.getInfoUserEdit(user.id),
      ]);
      setProfile(profileResp ?? null);
      setProfileDetail(detailResp ?? null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const saveProfileDetail = useCallback(
    async (payload: User) => {
      const response = await userApiSource.postInfoUserSave(payload);
      await refreshProfileData();
      return response;
    },
    [refreshProfileData]
  );

  useEffect(() => {
    void refreshProfileData();
  }, [refreshProfileData]);

  const value = useMemo(
    () => ({
      loading,
      profile,
      profileDetail,
      refreshProfileData,
      saveProfileDetail,
    }),
    [loading, profile, profileDetail, refreshProfileData, saveProfileDetail]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within ProfileProvider");
  }
  return context;
}
