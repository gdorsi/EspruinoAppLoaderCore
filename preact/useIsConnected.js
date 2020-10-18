import { useInstalledApps } from "./useInstalledApps.js";

export function useIsConnected() {
  return useInstalledApps().list !== null;
}
