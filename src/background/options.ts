import defaultKeybinds from '../content/defaultKeybinds.js';
import { KeyConfig, ToggleConfig } from '../content/types';

let keyConfig: { [key: string]: KeyConfig | ToggleConfig };

let globalOptionsPanel = document.querySelector<HTMLDivElement>('.global');
let displayOptionsPanel = document.querySelector<HTMLDivElement>('.display');
let hotkeyOptionsPanel = document.querySelector<HTMLDivElement>('.hotkey');

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
  for (let key in defaultKeybinds) {
    keyConfig[key] = defaultKeybinds[key].config;
  }

  return await chrome.storage.local.get(keyConfig);
}

function saveSettings() {
  chrome.storage.local.set(keyConfig);
}

function getConfigFromDefaultKeybinds (): { [key: string]: KeyConfig | ToggleConfig } {
  let tempDict: {[key: string]: KeyConfig | ToggleConfig} = {}
  for (let key of Object.keys(defaultKeybinds)) {
    tempDict[key] = defaultKeybinds[key].config;
  }
  return tempDict;
}

async function resetToDefaults (e: MouseEvent) {
  await chrome.storage.local.clear();
  await chrome.storage.local.set(getConfigFromDefaultKeybinds());
  chrome.tabs.reload();
}

function handleHotkeyDivState(state: boolean) {
  if (!state) {
    hotkeyOptionsPanel?.classList.add('blur');
  } else {
    hotkeyOptionsPanel?.classList.remove('blur');
  }
}

window.addEventListener('load', async function () {
  keyConfig = await loadSettings();
  for (let key in keyConfig) {
    let config = keyConfig[key];
    if ('ctrl' in config) {
      if (!('ctrl' in config)) continue;
      // const div = document.createElement("div");
      // div.setAttribute("id", key);
      const label = document.createElement('label');
      label.innerText = defaultKeybinds[key].description;
      label.setAttribute('for', key);
      const input = document.createElement('input');
      input.addEventListener('keydown', readKeys);
      input.setAttribute('type', 'text');
      input.setAttribute('data-key', key);
      input.setAttribute('id', key);
      input.value = keyboardConfigToString(config);
      hotkeyOptionsPanel?.appendChild(label);
      hotkeyOptionsPanel?.appendChild(input);
    } else if (!('ctrl' in config) && defaultKeybinds[key].type !== 'meta') {
      const label = document.createElement('label');
      label.innerText = defaultKeybinds[key].description;
      label.setAttribute('for', key);
      const input = document.createElement('input');
      input.id = key;
      input.setAttribute('data-key', key);
      input.setAttribute('type', 'checkbox');
      input.checked = config.enabled;
      console.log(key);
      console.log(config.enabled);
      console.log(keyConfig[key].enabled);
      input.addEventListener('change', readChecks);
      displayOptionsPanel?.appendChild(label);
      displayOptionsPanel?.appendChild(input);
    } else if (defaultKeybinds[key].type === 'meta') {
      const label = document.createElement('label');
      label.setAttribute('for', key);
      label.innerText = defaultKeybinds[key].description;
      const input = document.createElement('input');
      input.setAttribute('type', 'checkbox');
      input.checked = config.enabled;
      input.id = key;
      input.setAttribute('data-key', key);
      input.addEventListener('change', readChecks);
      globalOptionsPanel?.appendChild(label);
      globalOptionsPanel?.appendChild(input);
    }
  }
  const button = document.createElement("button");
  button.innerText = "Reset";
  button.title = "Reset all settings to default";
  button.id = "reset";
  button.addEventListener("click", resetToDefaults);
  
  globalOptionsPanel?.classList.remove("hide");
  displayOptionsPanel?.classList.remove("hide");
  hotkeyOptionsPanel?.classList.remove("hide");

  globalOptionsPanel?.appendChild(button);
  let toggleAll = document.querySelector<HTMLInputElement>('#toggle');
  if (toggleAll) {
    handleHotkeyDivState(toggleAll.checked);
    toggleAll.addEventListener('change', () => {
      if (toggleAll) { // I am outraged that typescript makes me do this
        handleHotkeyDivState(toggleAll.checked);
      }
    });
  }
});
