import defaultKeybinds from "./defaultKeybinds";
import * as utilities from './functions/utilities';
import * as types from './types';


("use strict");

// Associative array to hold user preferences
var hotkey_dict: { [key: string]: types.KeyDictionary } = {};

// Load user hotkeys into array.
chrome.storage.local.get(defaultKeybinds, function (items) {
  Object.keys(items).forEach(function (key, index) {
    hotkey_dict[key] = items[key];
  });
});

window.addEventListener("load", function () {
  // injecting a few simple styles to reference in above functions
  const inlineStyles = document.createElement("style");
  const buttonStyle = `.whitespace_button {float:left;clear:left;display:inline-block;margin-left:120px;}`;
  const privacyStyle = `.privacy {font-weight:bold;text-decoration:underline}.privacy-color {background:goldenrod}`;

  inlineStyles.innerText = buttonStyle + privacyStyle;

  document.querySelector("head")?.append(inlineStyles);

  // Event listener to execute callback on keypress
  document.onkeydown = keyCallback;

  document.oncontextmenu = listingMoreActionsContext;

  // Mutation observer for automatic changes to DOM
  const observer = new MutationObserver(domCallback);
  observer.observe(document, {
    attributes: false,
    childList: true,
    subtree: true,
  });
});
