import PocketBase, { BaseAuthStore } from "pocketbase";

// Expo replaces this direct property access when bundling. This URL is public.
const configuredUrl = process.env.EXPO_PUBLIC_POCKETBASE_URL?.trim();
let baseUrl = null;

try {
  const url = new URL(configuredUrl || "");
  if (
    ["http:", "https:"].includes(url.protocol) &&
    !url.username &&
    !url.password &&
    !url.search &&
    !url.hash
  ) {
    baseUrl = url.toString().replace(/\/$/, "");
  }
} catch {
  // Missing/invalid configuration is reported by the health service, not a crash.
}

// One client, memory-only store. No credentials or authentication are configured.
const pocketbase = baseUrl
  ? new PocketBase(baseUrl, new BaseAuthStore())
  : null;

export default pocketbase;

export async function checkPocketBaseHealth({ signal } = {}) {
  if (!pocketbase) {
    return {
      status: "unconfigured",
      message:
        "Set EXPO_PUBLIC_POCKETBASE_URL to an HTTP(S) server URL in .env.local, then reload Expo.",
    };
  }

  const controller = new AbortController();
  const cancel = () => controller.abort();
  let timedOut = false;
  signal?.addEventListener("abort", cancel);
  if (signal?.aborted) cancel();
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 8000);

  try {
    const health = await pocketbase.health.check({
      signal: controller.signal,
      requestKey: null,
    });
    return health.code === 200 || health.status === 200
      ? { status: "connected", message: "PocketBase API is reachable." }
      : {
          status: "error",
          message: "The server returned an unexpected health response.",
        };
  } catch {
    if (signal?.aborted)
      return { status: "cancelled", message: "Connectivity check cancelled." };
    return {
      status: "error",
      message: timedOut
        ? "Connection timed out. Check the server, network and PocketBase URL, then retry."
        : "Cannot reach a healthy PocketBase API. Check the server, network and URL, then retry.",
    };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
}
