import * as RX from "rxjs";
import { useEffect, useState } from "react";
import React from "react";
import { useViewer } from "@/components/services/scene-service/scene-provider";

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

export const useEntities = () => {
  const viewer = useViewer();

  const entities = useSubscribe(
    viewer.entityControl.$entities,
    viewer.entityControl.entities
  );
  return entities;
};
