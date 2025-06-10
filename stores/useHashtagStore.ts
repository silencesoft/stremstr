import { create } from "zustand";

type HashtagStore = {
  hashtags: string[];
  addHashtags: (tags: string[]) => void;
  resetHashtags: () => void;
};

export const useHashtagStore = create<HashtagStore>((set) => ({
  hashtags: [],
  addHashtags: (tags) =>
    set((state) => {
      const allTags = new Set([...state.hashtags, ...tags.map((t) => t.toLowerCase())]);
      return {
        hashtags: Array.from(allTags).sort((a, b) => a.localeCompare(b)),
      };
    }),
  resetHashtags: () => set({ hashtags: [] }),
}));
