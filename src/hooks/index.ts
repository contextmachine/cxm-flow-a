import * as RX from "rxjs";
import { useEffect, useState } from "react";

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
