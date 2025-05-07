import { create } from "zustand";
import { relayInit, Relay } from "nostr-tools";

type RelayState = {
  relays: { url: string; connection: Relay | null }[];
  addRelay: (url: string) => void;
  connectAll: () => Promise<void>;
  getActiveRelays: () => Relay[];
  isConnected: () => boolean;
};

export const useRelayStore = create<RelayState>((set, get) => ({
  relays: [
    { url: "wss://nostr.mom", connection: null },
    { url: "wss://nos.lol", connection: null },
    { url: "wss://relay.damus.io", connection: null },
    { url: "wss://relay.nostr.band", connection: null },
    // { url: "wss://nostr.wine", connection: null },
    // { url: "wss://relay.snort.social", connection: null },
  ],
  addRelay: (url) => {
    const exists = get().relays.find((r) => r.url === url);
    if (!exists) {
      set((state) => ({
        relays: [...state.relays, { url, connection: null }],
      }));
    }
  },
  connectAll: async () => {
    const newRelays = await Promise.all(
      get().relays.map(async (r) => {
        const relay = relayInit(r.url);
        try {
          await relay.connect();
          return { url: r.url, connection: relay };
        } catch (err) {
          console.warn(`⚠️ Failed to connect to ${r.url}`);
          return { url: r.url, connection: null };
        }
      })
    );
    set({ relays: newRelays });
  },
  getActiveRelays: () =>
    get()
      .relays.map((r) => r.connection)
      .filter((r): r is Relay => r !== null),
  isConnected: () => {
    const active = get().relays.filter(
      (r) => r.connection && r.connection.status === 1
    );
    return active.length > 0;
  },
}));
