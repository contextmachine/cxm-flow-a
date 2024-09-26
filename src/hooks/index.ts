import * as RX from "rxjs";
import { useEffect, useState } from "react";
import React from "react";
import {
  useScene,
  useViewer,
  useViewerSoft,
} from "@/components/services/scene-service/scene-provider";
import { MessageType } from "@/components/ui/scene/message/message";

export const useSubscribe = <T>(
  observable: RX.Observable<T>,
  initialValue: T | (() => T)
) => {
  const [state, setState] = useState(initialValue);
  useEffect(() => {
    const subscription = observable.subscribe(setState);
    return () => subscription.unsubscribe();
  }, [observable]);
  return state;
};

export const useClickOutside = (ref: any, callback: () => void) => {
  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target)) {
      callback();
    }
  };
  React.useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
};

export const useEnterEsc = (onPressed: () => void) => {
  useEffect(() => {
    const onKeyPressed = (e: KeyboardEvent): void => {
      if (e.key === "Enter" || e.key === "Esc") {
        onPressed();
      }
    };

    document.addEventListener("keydown", onKeyPressed);
    return () => {
      document.removeEventListener("keydown", onKeyPressed);
    };
  });
};

export const useSelected = () => {
  const viewer = useViewer();

  const selected = useSubscribe(
    viewer.selectionTool.$selected,
    viewer.selectionTool.selected
  );

  return selected;
};

export const useCurrentGroup = () => {
  const viewer = useViewer();

  const currentGroup = useSubscribe(
    viewer.selectionTool.picker.$currentGroup,
    undefined
  );

  return currentGroup;
};

export const useMessage = () => {
  const [state, setState] = useState<MessageType>();

  const { sceneService } = useScene();
  const viewer = sceneService.viewer;

  useEffect(() => {
    if (viewer) {
      const subscription = viewer.$message.subscribe((e) => {
        setState(e);
      });
      return () => subscription.unsubscribe();
    }
  }, [viewer]);

  useEffect(() => {}, [state]);

  return state;
};

export const useEntities = () => {
  const viewer = useViewer();

  const entities = useSubscribe(
    viewer.entityControl.$entities,
    viewer.entityControl.entities
  );
  return entities;
};
