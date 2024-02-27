import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig(({command}) => ({
  plugins: [react(), tsconfigPaths()],
  // define:
  //   command === "build"
  //     ? {
  //         "global.": "({}).",
  //       }
  //     : {global: {}},
  server: {
    open: true,
    port: 3000,
  },
  preview: {
    port: 3000,
  },
}));
