import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";

const useSubscribe = (observable: BehaviorSubject<any>) => {
  const [state, setState] = useState(observable.getValue());

  useEffect(() => {
    const subscription = observable.subscribe(setState);
    return () => subscription.unsubscribe();
  }, [observable]);

  return [state, observable.next.bind(observable)];
};

export default useSubscribe;
