export type KeyDictionary = {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
  code: string;
};

export type SettingsObj = {
  [key: string]: KeyDictionary
}