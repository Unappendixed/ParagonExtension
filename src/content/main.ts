import defaultKeybinds from "./defaultKeybinds.js";
import {getNestedFrame, keyMatch} from "./functions/utilities.js";
import { DomDictionary, KeyConfig, KeyDictionary, SettingsObj, ToggleConfig } from "./types";

("use strict");

// Associative array to hold user preferences
const settingsDict: SettingsObj = defaultKeybinds;
let keyConfig: { [key: string]: ToggleConfig | KeyConfig } = {}

for (let key in settingsDict) {
  keyConfig[key] = settingsDict[key].config;
}

chrome.storage.local.get(keyConfig).then(res => {
  for (let key in settingsDict) {
    let option = settingsDict[key];
    option.config = res[key];
    settingsDict[key] = option;
  }
});

function keyCallback(e: KeyboardEvent) {
  console.log(settingsDict);
  for (let key in settingsDict) {
    let keyObj = settingsDict[key];
    if (keyObj.type !== "key") continue;
    if (keyMatch(keyObj as KeyDictionary, e)) {
      try {
        (keyObj as KeyDictionary).function(e);
      } catch (e) {}
      return;
    }
  }
}


function domCallback(mutationList: MutationRecord[], observer: MutationObserver) {
  if (window.top == null) return;
  const isBannerInMutationList = mutationList.every((e) => (e.target as HTMLElement).id === "app_banner_session");
  if (isBannerInMutationList) return;
  let frame = getNestedFrame(window.top, "listingFrame");
  if (typeof frame != "boolean") {
    for (let key in settingsDict) {
      let setting = settingsDict[key] as DomDictionary;
      if (setting.type === "dom" && (setting.config.enabled || true)) {
        // disconnectObserver(observer, document);
        setting.function(frame.contentDocument);
        // reconnectObserver(observer, document);
      }
    }
  }
}

export function main() {
  // injecting a few simple styles to reference in above functions
  const inlineStyles = document.createElement("style");
  const buttonStyle = `.whitespace-button {float:left;clear:left;display:inline-block;margin-left:120px;}`;
  const privacyStyle = `.privacy {font-weight:bold;text-decoration:underline}.privacy-color {background:goldenrod}`;

  inlineStyles.innerText = buttonStyle + privacyStyle;

  document.querySelector("head")?.append(inlineStyles);

  // Event listener to execute callback on keypress
  document.onkeydown = keyCallback;

  // document.oncontextmenu = listingMoreActionsContext;

  // Mutation observer for automatic changes to DOM
  const observer = new MutationObserver(domCallback);
  observer.observe(document, {
    attributes: false,
    childList: true,
    subtree: true,
  });
}
