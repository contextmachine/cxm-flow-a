export interface ExtensionEntityInterface {
  name: string;

  load(): void;
  unload(): void;
}
