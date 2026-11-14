// Load .env (gitignored) into process.env. Only the server and scripts import this,
// so GEMINI_API_KEY never reaches the browser bundle.
try {
  process.loadEnvFile(".env");
} catch {
  // No .env: run with the keyword fallback.
}

export const env = {
  geminiKey: process.env.GEMINI_API_KEY?.trim() || "",
  geminiModel: process.env.GEMINI_MODEL?.trim() || "gemini-flash-lite-latest",
  port: Number(process.env.PORT) || 8787,
  production: process.env.NODE_ENV === "production",
};
