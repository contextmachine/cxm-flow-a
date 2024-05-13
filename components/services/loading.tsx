import { useEffect, useState } from "react";
import Loader from "../ui/auth/loader/loader";
import { useScene } from "./scene-service/scene-provider";

export function Loading({ children }: any) {
  const [loading, setLoading] = useState<boolean>(true);

  const status = useStatus();

  useEffect(() => {
    console.log(status, status === "loading");
    setLoading(status === "loading");
  }, [status]);

  return <>{loading && <Loader />}</>;
}

export function useStatus() {
  const [state, setState] = useState("loading");

  const { sceneService } = useScene();
  const viewer = sceneService.viewer;

  useEffect(() => {
    if (viewer) {
      const subscription = viewer.loader.$status.subscribe(setState);
      return () => subscription.unsubscribe();
    }
  }, [viewer]);

  return state;
}
