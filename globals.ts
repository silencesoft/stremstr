// Global WebSocket configuration for React Native and Web
// This file ensures WebSocket works properly across all platforms

// Detect platform
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
const isWeb = typeof window !== 'undefined' && !isReactNative;

// Get the appropriate WebSocket global
const getWebSocketGlobal = () => {
  if (typeof global !== 'undefined' && global.WebSocket) {
    return global;
  }
  if (typeof window !== 'undefined' && window.WebSocket) {
    return window;
  }
  return null;
};

const wsGlobal = getWebSocketGlobal();

if (wsGlobal && wsGlobal.WebSocket) {
  const originalWebSocket = wsGlobal.WebSocket;
  
  // @ts-ignore
  wsGlobal.WebSocket = class extends originalWebSocket {
    constructor(url: string, protocols?: string | string[]) {
      console.log(`🔌 [${isReactNative ? 'RN' : 'Web'}] WebSocket connecting to: ${url}`);
      super(url, protocols);
      
      this.addEventListener('open', () => {
        console.log(`✅ [${isReactNative ? 'RN' : 'Web'}] WebSocket opened: ${url}`);
      });
      
      this.addEventListener('error', (event) => {
        console.error(`❌ [${isReactNative ? 'RN' : 'Web'}] WebSocket error on ${url}:`, event);
      });
      
      this.addEventListener('close', (event) => {
        console.log(`🔌 [${isReactNative ? 'RN' : 'Web'}] WebSocket closed: ${url}, code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);
      });
    }
  };
  
  console.log(`✅ WebSocket monitoring enabled for ${isReactNative ? 'React Native' : 'Web'}`);
} else {
  console.warn('⚠️ WebSocket not available in this environment');
}

export {};
