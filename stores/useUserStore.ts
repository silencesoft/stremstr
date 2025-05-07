import { create } from "zustand";
import { fetchUserProfile } from "../services/nostrUser";

type UserProfile = {
  name: string;
  avatar?: string;
  picture?: string;
  nip05?: string;
  lud16?: string;
  lud06?: string;
};

type UserStore = {
  profiles: Record<string, UserProfile>;
  getProfile: (pubkey: string) => UserProfile | undefined;
  fetchAndCacheProfile: (pubkey: string) => Promise<UserProfile>;
};

const inflightCache: Record<string, Promise<UserProfile>> = {};

export const useUserStore = create<UserStore>((set, get) => ({
  profiles: {},
  getProfile: (pubkey) => get().profiles[pubkey],
  fetchAndCacheProfile: async (pubkey) => {
    const cached = get().profiles[pubkey];
    if (cached) return cached;

    if (!inflightCache[pubkey]) {
      inflightCache[pubkey] = fetchUserProfile(pubkey)
        .then((profile) => {
          set((state) => ({
            profiles: { ...state.profiles, [pubkey]: profile },
          }));
          return profile;
        })
        .finally(() => {
          delete inflightCache[pubkey];
        });
    }

    return inflightCache[pubkey];
  },
}));
