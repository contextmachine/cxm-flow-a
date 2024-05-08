import { v4 as uuidv4 } from "uuid";

class ApiObject {
  private _id: string = uuidv4();
  private _entry: string;

  constructor(id: number, entry: string) {
    this._entry = entry;
  }

  public get entry() {
    return this._entry;
  }
}

export default ApiObject;
