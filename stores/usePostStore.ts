import { MediaPost } from "@/types/media";
import { create } from "zustand";

type PostStore = {
  posts: MediaPost[];
  loadingInitial: boolean;
  loadingMore: boolean;
  error: string | null;
  addPosts: (posts: MediaPost[]) => void;
  resetPosts: () => void;
  setLoadingInitial: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getPostById: (id: string) => MediaPost | undefined;
  updatePostUser: (postId: string, user: MediaPost["user"]) => void;
};

export const usePostStore = create<PostStore>((set, get) => ({
  posts: [],
  loadingInitial: false,
  loadingMore: false,
  error: null,
  addPosts: (newPosts) =>
    set((state) => {
      const existingIds = new Set(state.posts.map((p) => p.id));
      const filtered = newPosts.filter((p) => !existingIds.has(p.id));
      return { posts: [...state.posts, ...filtered] };
    }),
  resetPosts: () => set({ posts: [] }),
  setLoadingInitial: (loading) => set({ loadingInitial: loading }),
  setLoadingMore: (loading) => set({ loadingMore: loading }),
  setError: (error) => set({ error }),
  getPostById: (id) => get().posts.find((p) => p.id === id),
  updatePostUser: (postId, user) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, user } : post
      ),
    })),
}));
