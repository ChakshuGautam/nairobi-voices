import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Served under https://bometfeedbackhub.digit.org/voices/ on the Bomet server.
  // API calls use absolute "/pgr-services/..." paths so they still hit Kong at the
  // domain root regardless of this base. Override with VITE_BASE_PATH for other hosts.
  base: process.env.VITE_BASE_PATH ?? "/voices/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
