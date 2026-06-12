import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  avatarUri: string | null;
  joinedAt: number;
}

interface ProfileContextType {
  profile: UserProfile;
  isLoaded: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const PROFILE_KEY = "@library:profile";

const DEFAULT_PROFILE: UserProfile = {
  name: "Learner",
  username: "@learner",
  email: "",
  avatarUri: null,
  joinedAt: Date.now(),
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then((json) => {
        if (json) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(json) });
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, isLoaded, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextType {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
