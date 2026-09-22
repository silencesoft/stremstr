import { create } from "zustand";
import { relayInit, Relay } from "nostr-tools";

type RelayState = {
  relays: { url: string; connection: Relay | null; failureCount?: number }[];
  addRelay: (url: string) => void;
  connectAll: () => Promise<void>;
  getActiveRelays: () => Relay[];
  isConnected: () => boolean;
};

export const useRelayStore = create<RelayState>((set, get) => ({
  relays: [
    // Multiple relays for better reliability - tries each up to 3 times
    { url: "wss://nostr.mom", connection: null, failureCount: 0 },
    { url: "wss://nos.lol", connection: null, failureCount: 0 },
    { url: "wss://nostr.wine", connection: null },
    { url: "wss://relay.snort.social", connection: null },
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
    console.log('🚀 Starting relay connections...');
    
    const MAX_RETRIES = 3;
    
    const newRelays = await Promise.all(
      get().relays.map(async (r) => {
        const currentFailures = r.failureCount || 0;
        
        // Skip if already failed 3+ times
        if (currentFailures >= MAX_RETRIES) {
          console.warn(`⏭️ Skipping ${r.url} (failed ${currentFailures} times, max retries reached)`);
          return { url: r.url, connection: null, failureCount: currentFailures };
        }
        
        try {
          console.log(`🔄 Attempting to connect to ${r.url}... (attempt ${currentFailures + 1}/${MAX_RETRIES})`);
          const relay = relayInit(r.url);
          
          // Add timeout to prevent hanging
          const connectPromise = relay.connect();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
          );
          
          await Promise.race([connectPromise, timeoutPromise]);
          
          // Verify connection status
          if (relay.status === 1) {
            console.log(`✅ Connected to ${r.url} (status: ${relay.status})`);
            
            relay.on('error', () => {
              console.warn(`❌ Error on relay ${r.url}`);
            });
            
            relay.on('disconnect', () => {
              console.warn(`🔌 Disconnected from ${r.url}`);
            });
            
            // Reset failure count on successful connection
            return { url: r.url, connection: relay, failureCount: 0 };
          } else {
            console.warn(`⚠️ Connected but not ready: ${r.url} (status: ${relay.status})`);
            return { url: r.url, connection: null, failureCount: currentFailures + 1 };
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          const newFailureCount = currentFailures + 1;
          
          if (newFailureCount >= MAX_RETRIES) {
            console.error(`🚫 ${r.url} permanently failed after ${MAX_RETRIES} attempts. Will not retry.`);
          } else {
            console.warn(`❌ Failed to connect to ${r.url}: ${errorMessage} (${newFailureCount}/${MAX_RETRIES})`);
          }
          
          return { url: r.url, connection: null, failureCount: newFailureCount };
        }
      })
    );
    
    set({ relays: newRelays });
    
    const activeCount = newRelays.filter(r => r.connection !== null).length;
    console.log(`📊 Connected to ${activeCount}/${newRelays.length} relays`);
    
    if (activeCount === 0) {
      console.error('❌ CRITICAL: No relays connected! Check your internet connection and relay URLs.');
    }
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
