import { Event } from "nostr-tools";
import { useRelayStore } from "@/stores/useRelayStore";

export async function fetchUserProfile(pubkey: string): Promise<any> {
  const activeRelays = useRelayStore.getState().getActiveRelays();

  if (activeRelays.length === 0) {
    console.warn("No active relays. Try calling connectAll() first.");
    throw new Error("No active relays available.");
  }

  for (const relay of activeRelays) {
    try {
      return await new Promise((resolve, reject) => {
        const sub = relay.sub([
          {
            kinds: [0],
            authors: [pubkey],
          },
        ]);

        let resolved = false;

        sub.on("event", (event: Event) => {
          if (!resolved) {
            resolved = true;
            const profile = JSON.parse(event.content);
            sub.unsub();
            resolve(profile);
          }
        });

        sub.on("eose", () => {
          if (!resolved) {
            sub.unsub();
            reject(new Error("Profile not found"));
          }
        });

        setTimeout(() => {
          if (!resolved) {
            sub.unsub();
            reject(new Error("Timeout fetching user profile"));
          }
        }, 3000);
      });
    } catch (err) {
      console.warn(`Failed to fetch from relay`, relay.url, err);
    }
  }

  throw new Error("Failed to fetch user profile from all active relays.");
}
