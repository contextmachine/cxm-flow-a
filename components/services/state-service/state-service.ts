class StateService {
  private _isWidgetsOpen = false;

  private $setIsWidgetsOpen: (value: boolean) => void = () => {};

  constructor() {
    return;
  }

  public toogleWidgets(value?: boolean) {
    this._isWidgetsOpen =
      typeof value === "boolean" ? value : !this._isWidgetsOpen;

    this.$setIsWidgetsOpen(this._isWidgetsOpen);
  }

  public provideState({
    setIsWidgetsOpen,
  }: {
    setIsWidgetsOpen: (value: boolean) => void;
  }) {
    this.$setIsWidgetsOpen = setIsWidgetsOpen;
  }
}

export default StateService;
