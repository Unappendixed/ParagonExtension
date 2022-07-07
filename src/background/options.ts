import { OptionDictionary } from './../content/types';
import defaultHotkeys from '../content/defaultKeybinds.js';
import { KeyConfig, ToggleConfig } from '../content/types';

let keyConfig: { [key: string]: KeyConfig | ToggleConfig };

function readKeys(e: KeyboardEvent) {
  e.preventDefault();
  if (e.target === null) return;
  var ctrl = e.ctrlKey ? 'Ctrl + ' : '';
  var alt = e.altKey ? 'Alt + ' : '';
  var shift = e.shiftKey ? 'Shift + ' : '';
  var character = !['Shift', 'Alt', 'Control'].includes(e.key) ? e.key : 'None';
  let target = e.target as HTMLInputElement;
  let key = target.getAttribute('data-key');
  if (key === null) return;
  if (e.key == 'Escape') {
    target.value = 'None';
    keyConfig[key].enabled = false;
  } else if (character != 'None') {
    target.value = `${ctrl}${alt}${shift}${e.key.toUpperCase()}`;
    keyConfig[key] = {
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      key: e.key,
      code: e.code,
      enabled: true,
    };
    //console.log(hotkey_dict[e.target.id]['code'])
  }
  saveSettings();
}

function readChecks(e: Event) {
  let target = e.target as HTMLInputElement;
  if (target === null) return;
  let newValue = target.checked;
  let key = target.getAttribute('data-key');
  if (key) {
    keyConfig[key].enabled = newValue;
  }
  saveSettings();
}

function keyboardConfigToString(configObject: KeyConfig): string {
  var ctrl = configObject['ctrl'] ? 'Ctrl + ' : '';
  var alt = configObject['alt'] ? 'Alt + ' : '';
  var shift = configObject['shift'] ? 'Shift + ' : '';
  var key = configObject['key'].toUpperCase();
  return `${ctrl}${alt}${shift}${key}`;
}

async function loadSettings() {
  let keyConfig: { [key: string]: ToggleConfig | KeyConfig } = {};
  for (let key in defaultHotkeys) {
    keyConfig[key] = defaultHotkeys[key].config;
  }

  let response = await chrome.storage.local.get(keyConfig);
  // , function (items) {
  // console.log(items);
  // keyConfig = items;
  // });
  return keyConfig;
}

function saveSettings() {
  chrome.storage.local.set(keyConfig);
  chrome.storage.local.set({ test: 'come on man' });
}

function resetToDefaults() {}

window.addEventListener('load', async function () {
  keyConfig = await loadSettings();
  let globalOptionsPanel = document.querySelector<HTMLDivElement>('.global');
  let displayOptionsPanel = document.querySelector<HTMLDivElement>('.display');
  let hotkeyOptionsPanel = document.querySelector<HTMLDivElement>('.hotkey');
  for (let key in keyConfig) {
    let config = keyConfig[key];
    if ("ctrl" in config) {
      if (!('ctrl' in config)) continue;
      // const div = document.createElement("div");
      // div.setAttribute("id", key);
      const label = document.createElement('label');
      label.innerText = defaultHotkeys[key].description;
      label.setAttribute('for', key);
      const input = document.createElement('input');
      input.addEventListener('keydown', readKeys);
      input.setAttribute('type', 'text');
      input.setAttribute('data-key', key);
      input.setAttribute('id', key);
      input.value = keyboardConfigToString(config);
      hotkeyOptionsPanel?.appendChild(label);
      hotkeyOptionsPanel?.appendChild(input);
    } else if (!("ctrl" in config)) {
      const label = document.createElement('label');
      label.innerText = defaultHotkeys[key].description;
      label.setAttribute('for', key);
      const input = document.createElement('input');
      input.id = key;
      input.setAttribute('data-key', key);
      input.setAttribute('type', 'checkbox');
      input.checked = config.enabled;
      console.log(key);
      console.log(config.enabled);
      input.addEventListener('change', readChecks);
      displayOptionsPanel?.appendChild(label);
      displayOptionsPanel?.appendChild(input);
    }
  }
});
