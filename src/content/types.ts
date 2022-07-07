export interface KeyConfig {
  enabled: boolean;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
  code: string;
}

export interface ToggleConfig {
  enabled: boolean;
}

export interface OptionDictionary {
  type: "dom" | "mouse" | "meta" | "key";
  description: string;
  config: ToggleConfig;
}

export interface DomDictionary {
  type: "dom";
  description: string;
  config: ToggleConfig;
  function: Function;
}

export interface KeyDictionary extends OptionDictionary {
  description: string;
  type: "key";
  config: KeyConfig;
  function: Function;
}

export interface SettingsObj {
  [key: string]: OptionDictionary | KeyDictionary;
}
