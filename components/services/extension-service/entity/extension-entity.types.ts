import Viewer from "@/src/viewer/viewer";

export interface ExtensionEntityInterface {
  id: string;
  name: string;

  load(): void;
  unload(): void;

  [key: string]: any;
}
