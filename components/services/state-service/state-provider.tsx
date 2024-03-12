import { createContext, useContext, useEffect, useState } from "react";
import StateService from "./state-service";

interface StateProviderProps {
  stateService: StateService;
  isWidgetsOpen: boolean;
}

const StateContext = createContext<StateProviderProps | null>(null);

export function StateProvider({ children }: any) {
  const [stateService] = useState(() => new StateService());

  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);

  useEffect(() => {
    stateService.provideState({
      setIsWidgetsOpen,
    });
  }, []);

  return (
    <StateContext.Provider value={{ stateService, isWidgetsOpen }}>
      {children}
    </StateContext.Provider>
  );
}

export function useStates() {
  const service = useContext(StateContext);

  if (service === null) {
    throw new Error("useService must be used within a StatesProvider");
  }

  return service;
}
