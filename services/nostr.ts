import { Event, SimplePool } from "nostr-tools";
import { useRelayStore } from "@/stores/useRelayStore";
import { useUserStore } from "@/stores/useUserStore";

// Initialize NOSTR SimplePool for fetching posts
const pool = new SimplePool();

// Connect to relays
export const connectToRelays = async (): Promise<void> => {
  await useRelayStore.getState().connectAll();
};

// Fetch user profile
const fetchUserProfile = async (pubkey: string) => {
  try {
    const user = await useUserStore.getState().fetchAndCacheProfile(pubkey);
    return user;
  } catch (error) {
    console.warn(`Failed to load user profile for ${pubkey}`, error);
    return null;
  }
};

// Subscribe to Hashtag (now including fetching posts and user profiles)
export const subscribeToHashtag = (
  hashtag: string,
  onEvent: (event: Event, user: any) => void,
  options?: { limit?: number; until?: number }
): void => {
  const relays = useRelayStore.getState().getActiveRelays();

  for (const relay of relays) {
    const sub = relay.sub([
      {
        kinds: [1],
        "#t": [hashtag.toLowerCase()],
        limit: options?.limit ?? 20,
        ...(options?.until ? { until: options.until } : {}),
      },
    ]);

    sub.on("event", async (event: Event) => {
      const user = await fetchUserProfile(event.pubkey);
      onEvent(event, user);
    });
  }
};

// Fetch posts with pagination support and user profiles
export const fetchHashtagPosts = async ({
  hashtag,
  limit = 20,
  until,
}: {
  hashtag: string;
  limit?: number;
  until?: number;
}) => {
  const relays = useRelayStore.getState().getActiveRelays();

  // Fetch posts with the SimplePool using relays
  try {
    const filters = {
      kinds: [1],
      "#t": [hashtag.toLowerCase()],
      limit, // Ensure we send the limit for pagination
      ...(until ? { until } : {}),
    };

    // Use the pool to request events from relay URLs
    const events = await pool.list(
      relays.map((relay) => relay.url), // Map relays to their URLs
      [filters]
    );

    // Fetch user profiles for each post
    const postsWithUserProfiles = await Promise.all(
      events.map(async (event) => {
        const user = await fetchUserProfile(event.pubkey);
        return { event, user };
      })
    );

    // Sort events by created_at (newest first)
    return postsWithUserProfiles.sort(
      (a, b) => b.event.created_at - a.event.created_at
    );
  } catch (err) {
    console.error("Error fetching posts:", err);
    return [];
  }
};
