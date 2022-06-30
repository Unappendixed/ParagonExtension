export interface OptionDictionary {
  type: "dom" | "mouse" | "meta" | "key";
  config: {
    enabled: boolean;
  };
}

export interface DomDictionary {
  type: "dom",
  config: {
    enabled: boolean,
  },
  function: Function,
}

export interface KeyDictionary extends OptionDictionary {
  type: "key";
  config: {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    key: string;
    code: string;
    enabled: boolean;
  };
  function: Function;
}
export interface SettingsObj {
  [key: string]: OptionDictionary;
}
