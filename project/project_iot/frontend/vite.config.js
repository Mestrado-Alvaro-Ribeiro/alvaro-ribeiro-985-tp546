import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, "..", ""), ...process.env };
  return {
    define: {
      "import.meta.env.VITE_DEVICE_ID": JSON.stringify(
        env.DEVICE_ID || "room01",
      ),
      "import.meta.env.VITE_TOPIC_PREFIX": JSON.stringify(
        env.TOPIC_PREFIX || "iot/environment",
      ),
      "import.meta.env.VITE_PUBLISH_INTERVAL": JSON.stringify(
        env.PUBLISH_INTERVAL || "5",
      ),
    },
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        "/mqtt": {
          target: `ws://127.0.0.1:${env.MQTT_WS_PORT || "9001"}`,
          ws: true,
        },
      },
    },
  };
});
