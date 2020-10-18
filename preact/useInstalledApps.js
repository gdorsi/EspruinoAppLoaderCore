import { createStateAtom, useStateAtom } from "./atoms.js";
import { useToast } from "./Toast.js";
import { useComms } from "./useComms.js";

export const installedAtom = createStateAtom(null);

export function useInstalledApps() {
  //TODO use watchConnectionChange
  const [list, set] = useStateAtom(installedAtom);
  const Comms = useComms();
  const toast = useToast();

  function loadFromTheDevice() {
    return Comms.getInstalledApps()
      .then((apps) => {
        set(apps);

        return apps;
      })
      .catch((err) => {
        toast.show("Connection failed ", err);
      });
  }

  function disconnect() {
    Comms.disconnectDevice();
    set(null);
  }

  return {
    list,
    set,
    loadFromTheDevice,
    disconnect,
  };
}
