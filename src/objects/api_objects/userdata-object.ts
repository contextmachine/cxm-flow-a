import { ProjectObject } from "../entities/project-object";
import { UserData } from "./user-data.types";

class UserdataObject {
  private _entries: Map<string, UserdataEntry> = new Map();
  private _props: Map<string, boolean | number | string> = new Map();

  constructor(userdata: UserData) {
    if (userdata.entries) {
      const entries = new Map();

      userdata.entries.forEach((entry: UserdataEntry) => {
        const name = entry.name as UserdataEntryType;

        entries.set(name, entry);
      });

      this._entries = entries;
    }
  }

  /**
   * Сравниваем каких entries не хватает у данного объекта. Если чего то не достает,
   * то дополняем entries, полученных от главного projectObject модели
   */
  public supplyEntries(projectObject: ProjectObject | undefined) {
    if (!projectObject) return;

    const userdata = projectObject.userdata;

    if (userdata) {
      const entries = userdata.entries;
      Array.from(entries.entries()).forEach(([type, entry]) => {
        if (!this._entries.get(type)) {
          this.entries.set(type, entry);
        }
      });
    }
  }

  public get entries() {
    return this._entries;
  }

  public getEntry(entryType: string): UserdataEntry | undefined {
    return this._entries.get(entryType);
  }

  public get props() {
    return this._props;
  }
}

interface UserdataEndpoint {
  protocol: "REST";
  url: string;
  [key: string]: any;
}

type UserdataEntryType = "update_props";

export interface UserdataEntry {
  name: UserdataEntryType;
  endpoint: UserdataEndpoint;
  [key: string]: any;
}

export default UserdataObject;
