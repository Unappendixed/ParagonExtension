import { KeyDictionary, SettingsObj } from './types';
function assignPresetStyle(element: HTMLElement, preset: "focus" | "unfocus"): void {
  var style: Object = {};
	if (preset == "focus") {
		style = {
			opacity: "0.2",
			filter: "blur(3px)",
			pointerEvents: "none",
			userSelect: "none",
		};
	} else if (preset == "unfocus") {
		style = {
			opacity: "1",
			filter: "none",
			pointerEvents: "all",
			userSelect: "auto",
		};
	}
	Object.assign(element.style, style);
}

document.addEventListener("load", function () {
	var hotkey_dict = {};
	const restoreSettings = function () {
		const dictToString = function (dict: KeyDictionary): string {
			var ctrl = dict["ctrl"] ? "Ctrl + " : "";
			var alt = dict["alt"] ? "Alt + " : "";
			var shift = dict["shift"] ? "Shift + " : "";
			var key = dict["key"].toUpperCase();
			return `${ctrl}${alt}${shift}${key}`;
		};
		// add new settings here and they should cascade through the rest of the program.
		// make sure to use the DOM element ID for the key or it won't automatically register on the
		// control.
		chrome.storage.local.get(
			{
				toggle: true,
				tabindex: false,
				addbuttons: false,
				maintain_context: false,
				cancellation_shortcut: false,
				brokerage_header: false,
				region_warning: true,
				save: {
					ctrl: true,
					alt: false,
					shift: false,
					key: "s",
					code: "KeyS",
				},
				print: {
					ctrl: true,
					alt: false,
					shift: false,
					key: "q",
					code: "KeyQ",
				},
				search: {
					ctrl: true,
					alt: false,
					shift: true,
					key: "F",
					code: "KeyF",
				},
				expand: {
					ctrl: true,
					alt: false,
					shift: false,
					key: "]",
					code: "BracketRight",
				},
				collapse: {
					ctrl: true,
					alt: false,
					shift: false,
					key: "[",
					code: "BracketLeft",
				},
				goto_listings: {
					ctrl: false,
					alt: false,
					shift: false,
					key: "F1",
					code: "F1",
				},
				toggle_privacy: {
					ctrl: false,
					alt: false,
					shift: false,
					key: "F2",
					code: "F2",
				},
				close_tab: {
					ctrl: false,
					alt: true,
					shift: false,
					key: "`",
					code: "Backquote",
				},
				exp_calc: {
					ctrl: false,
					alt: false,
					shift: false,
					key: "F3",
					code: "F3",
				},
				goto_assume: {
					ctrl: false,
					alt: false,
					shift: false,
					key: "F4",
					code: "F4",
				},
			},
			function (items) {
				Object.keys(items).forEach(function (key, index) {
					hotkey_dict[key as keyof SettingsObj] = items[key];
					if (typeof items[key] == "object") {
						const keyInput: HTMLInputElement = document.querySelector(`#${key}`);
						keyInput.value = dictToString(items[key]);
					}
					const toggleAllInput: HTMLInputElement = document.querySelector("#toggle-all");
					const buttonWrapElement: HTMLElement = document.querySelector("#button_wrap");
					if (items["toggle"] == false) {
						toggleAllInput.checked = false;
            assignPresetStyle(buttonWrapElement, 'unfocus');
					} else {
            toggleAllInput.checked = true;
            assignPresetStyle(buttonWrapElement, 'focus');
					}
				});
			}
		);
		console.log(hotkey_dict);
	};

	const saveSettings = function () {
		if (confirm("Save these hotkeys?")) {
			chrome.storage.local.set(hotkey_dict);
		}
	};

	const readKeys = function (e) {
		e.preventDefault();
		var ctrl = e.ctrlKey ? "Ctrl + " : "";
		var alt = e.altKey ? "Alt + " : "";
		var shift = e.shiftKey ? "Shift + " : "";
		var character = !["Shift", "Alt", "Control"].includes(e.key) ? e.key : "None";
		if (e.key == "Escape") {
			e.target.value = "None";
			hotkey_dict[e.target.id] = "disabled";
		} else if (character != "None") {
			e.target.value = `${ctrl}${alt}${shift}${e.key.toUpperCase()}`;
			hotkey_dict[e.target.id] = {
				ctrl: e.ctrlKey,
				alt: e.altKey,
				shift: e.shiftKey,
				key: e.key,
				code: e.code,
			};
			//console.log(hotkey_dict[e.target.id]['code'])
		}
	};

	const responsiveChecks = function (e) {
		let element = e.target;
		let elem_id = element.id;
		hotkey_dict[elem_id] = element.checked;
		chrome.storage.local.set({ [elem_id]: element.checked });
		if (elem_id == "toggle") {
			switch_div();
		}
	};

	const switch_div = function () {
		const toggleInput: HTMLInputElement = document.querySelector("#toggle");
		hotkey_dict["toggle"] = toggleInput.checked;
    const buttonWrapElement: HTMLElement = document.querySelector("#button_wrap");
		if (hotkey_dict["toggle"] == false) {
      assignPresetStyle(buttonWrapElement, 'unfocus');
			chrome.storage.local.set({ toggle: false });
		} else {
      assignPresetStyle(buttonWrapElement, 'focus');
			chrome.storage.local.set({ toggle: true });
		}
	};

	var buttons: NodeListOf<Element> = document.querySelectorAll(".option_edit");
	for (var item of buttons) {
		item.addEventListener('click', readKeys);
	}
	var checks = document.querySelectorAll(".option_check");
	for (let item of checks) {
    item.addEventListener('click', responsiveChecks)
	}
  document.querySelector("#reset-form").addEventListener('click', restoreSettings);
  document.querySelector("#save-form").addEventListener('click', saveSettings);
	restoreSettings();
});
