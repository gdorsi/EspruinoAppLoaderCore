import { createStateAtom } from "./atoms.js";
import { useToast } from "./Toast.js";
import { useComms } from "./useComms.js";

export const pretokeniseAtom = createStateAtom(
  () => {
    const saved = localStorage.getItem("pretokenise");

    if (saved) {
      return JSON.parse(saved);
    }

    return true;
  },
  (pretokenise) => {
    localStorage.setItem("pretokenise", JSON.stringify(pretokenise));
  }
);

export function useAppsUtils() {
  const Comms = useComms();
  const toast = useToast();

  function setTime() {
    Comms.setTime().then(
      () => {
        toast.show("Time set successfully", "success");
      },
      (err) => {
        toast.show("Error setting time, " + err, "error");
      }
    );
  }

  return { setTime };
}
