import { useEffect, useState } from "react";
import Loader from "../ui/auth/loader/loader";
import { useScene, useViewer } from "./scene-service/scene-provider";
import { useSubscribe } from "@/src/hooks";

export function Loading({ children }: any) {
  const [loading, setLoading] = useState<boolean>(true);

  const status = useStatus();

  useEffect(() => {
    setLoading(status !== "idle");
  }, [status]);

  return <>{loading && <Loader message={status} />}</>;
}

export function useStatus() {
  const [state, setState] = useState("loading");

  const { sceneService } = useScene();
  const viewer = sceneService.viewer;

  useEffect(() => {
    if (viewer) {
      const subscription = viewer.loader.$status.subscribe((e) => {
        console.log("status changed, this from subscription", e);
        setState(e.toString());
      });
      return () => subscription.unsubscribe();
    }
  }, [viewer]);

  useEffect(() => {
    console.log("this from useEfffect", state);
  }, [state]);

  return state;
}
