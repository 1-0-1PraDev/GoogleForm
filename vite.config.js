import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "/GoogleForm/",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    assetsDir: "assets",
  },
  server: {
    port: 9000,
  },
});
