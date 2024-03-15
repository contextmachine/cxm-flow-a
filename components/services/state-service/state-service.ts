import { SectionType } from "./state-service.types";

class StateService {
  private _isWidgetsOpen = false;
  private _isEditWidgetsOpen = false;
  private _isPropertiesOpen = false;
  private _sectionType: SectionType = "widgets";

  private $setIsWidgetsOpen: (value: boolean) => void = () => {};
  private $setIsEditWidgetsOpen: (value: boolean) => void = () => {};
  private $setIsPropertiesOpen: (value: boolean) => void = () => {};
  private $setSectionType: (value: SectionType) => void = () => {};

  constructor() {
    return;
  }

  public toogleWidgets(value?: boolean) {
    this._isWidgetsOpen =
      typeof value === "boolean" ? value : !this._isWidgetsOpen;

    this.$setIsWidgetsOpen(this._isWidgetsOpen);
  }

  public toogleEditWidgets(value?: boolean) {
    this._isEditWidgetsOpen =
      typeof value === "boolean" ? value : !this._isEditWidgetsOpen;

    this.$setIsEditWidgetsOpen(this._isEditWidgetsOpen && this._isWidgetsOpen);
  }

  public toogleProperties(value?: boolean) {
    if (value) this.toogleEditWidgets(false);

    this._isPropertiesOpen =
      typeof value === "boolean" ? value : !this._isPropertiesOpen;

    this.$setIsPropertiesOpen(this._isPropertiesOpen);
  }

  public openSection(sectionType: SectionType) {
    this._sectionType = sectionType;
    this.$setSectionType(sectionType);
  }

  public provideState({
    setIsWidgetsOpen,
    setIsEditWidgetsOpen,
    setIsPropertiesOpen,
    setSectionType,
  }: {
    setIsWidgetsOpen: (value: boolean) => void;
    setIsEditWidgetsOpen: (value: boolean) => void;
    setIsPropertiesOpen: (value: boolean) => void;
    setSectionType: (value: SectionType) => void;
  }) {
    this.$setIsWidgetsOpen = setIsWidgetsOpen;
    this.$setIsEditWidgetsOpen = setIsEditWidgetsOpen;
    this.$setIsPropertiesOpen = setIsPropertiesOpen;
    this.$setSectionType = setSectionType;
  }
}

export default StateService;
