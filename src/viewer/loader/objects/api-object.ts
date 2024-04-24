import { v4 as uuidv4 } from "uuid";

class ApiObject {

  private _id: string = uuidv4();
  private _entry: string

  constructor(entry: string) {

    this._entry = entry

  }

}


export default ApiObject;
