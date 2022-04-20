export type KeyDictionary = {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
  code: string;
};

type OptionalKeyDictionary =  KeyDictionary | 'disabled';

type OptionalBoolean = boolean | 'disabled';

export type SettingsObj = {
  [key: string]: boolean | KeyDictionary | 'disabled'
};
