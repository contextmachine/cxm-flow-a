import { BehaviorSubject } from "rxjs";
import { SectionType } from "./state-service.types";

class StateService {
  private _isWidgetsOpen = false;
  private _isEditWidgetsOpen = false;
  private _isPropertiesOpen = false;
  private _sectionType: SectionType = "widgets";

  private _isWidgetsOpen$ = new BehaviorSubject<boolean>(false);
  private _isEditWidgetsOpen$ = new BehaviorSubject<boolean>(false);
  private _isPropertiesOpen$ = new BehaviorSubject<boolean>(false);
  private _sectionType$ = new BehaviorSubject<SectionType>("widgets");

  constructor() {
    return;
  }

  public toogleWidgets(value?: boolean) {
    this._isWidgetsOpen =
      typeof value === "boolean" ? value : !this._isWidgetsOpen;

    this._isWidgetsOpen$.next(this._isWidgetsOpen);
  }

  public toogleEditWidgets(value?: boolean) {
    this._isEditWidgetsOpen =
      typeof value === "boolean" ? value : !this._isEditWidgetsOpen;

    if (this._isEditWidgetsOpen) this.openSection("widgets");

    this._isEditWidgetsOpen$.next(
      this._isEditWidgetsOpen && this._isWidgetsOpen
    );
  }

  public toogleProperties(value?: boolean) {
    if (value) this.toogleEditWidgets(false);

    this._isPropertiesOpen =
      typeof value === "boolean" ? value : !this._isPropertiesOpen;

    this._isPropertiesOpen$.next(this._isPropertiesOpen);
  }

  public openSection(sectionType: SectionType) {
    this._sectionType = sectionType;
    this._sectionType$.next(this._sectionType);
  }

  public get isWidgetsOpen$() {
    return this._isWidgetsOpen$;
  }

  public get isEditWidgetsOpen$() {
    return this._isEditWidgetsOpen$;
  }

  public get isPropertiesOpen$() {
    return this._isPropertiesOpen$;
  }

  public get sectionType$() {
    return this._sectionType$;
  }

  public dispose() {
    this._isWidgetsOpen$.complete();
    this._isEditWidgetsOpen$.complete();
    this._isPropertiesOpen$.complete();
    this._sectionType$.complete();
  }
}

export default StateService;
