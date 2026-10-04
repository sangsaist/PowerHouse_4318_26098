import { useEffect, useState } from "react";
import { loadCadModel, onModelProgress } from "./cadModel.js";

export function useCadModel() {
  const [state, setState] = useState({ status: "loading", progress: 0, data: null });

  useEffect(() => {
    let alive = true;
    const off = onModelProgress((p) => alive && setState((s) => (s.status === "loading" ? { ...s, progress: p } : s)));
    loadCadModel().then(
      (data) => alive && setState({ status: "ready", progress: 1, data }),
      (error) => {
        console.error(error);
        alive && setState({ status: "error", progress: 0, data: null });
      },
    );
    return () => {
      alive = false;
      off();
    };
  }, []);

  return state;
}
