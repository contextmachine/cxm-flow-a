import { createContext, useContext, useEffect, useState } from "react";
import StateService from "./state-service";
import { SectionType } from "./state-service.types";

interface StateProviderProps {
  stateService: StateService;
  isWidgetsOpen: boolean;
  isEditWidgetsOpen: boolean;
  isPropertiesOpen: boolean;
  sectionType: SectionType;
}

const StateContext = createContext<StateProviderProps | null>(null);

export function StateProvider({ children }: any) {
  const [stateService] = useState(() => new StateService());

  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  const [isEditWidgetsOpen, setIsEditWidgetsOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [sectionType, setSectionType] = useState<SectionType>("widgets");

  useEffect(() => {
    stateService.provideState({
      setIsWidgetsOpen,
      setIsEditWidgetsOpen,
      setIsPropertiesOpen,
      setSectionType,
    });
  }, []);

  return (
    <StateContext.Provider
      value={{
        stateService,
        isWidgetsOpen,
        isEditWidgetsOpen,
        isPropertiesOpen,
        sectionType,
      }}
    >
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
