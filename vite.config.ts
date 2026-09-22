import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { responseStoreAdapter } from "@vinext/cloudflare/cache/response-store-adapter";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

export default defineConfig(({ command }) => ({
  plugins: [
    vinext({
      // The Response Store adapter needs the generated production entrypoint.
      // HMR uses vinext's default cache; start:vinext tests the real cache Worker.
      cache: command === "build" ? responseStoreAdapter() : undefined,
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      auxiliaryWorkers: [
        { configPath: "./wrangler.response-store.jsonc", devOnly: true },
      ],
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
}));
