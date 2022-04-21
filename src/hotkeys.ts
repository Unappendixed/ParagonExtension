// type KeyDictionary = {
// 	ctrl: boolean;
// 	alt: boolean;
// 	shift: boolean;
// 	key: string;
// 	code: string;
// };

// type OptionalKeyDictionary = KeyDictionary | "disabled";

// type OptionalBoolean = boolean | "disabled";

// type SettingsObj = {
// 	[key: string]: boolean | KeyDictionary | "disabled";
// };

function assignPresetStyle(element: HTMLElement, preset: "focus" | "unfocus"): void {
	var style: Object = {};
	if (preset == "unfocus") {
		style = {
			opacity: "0.2",
			filter: "blur(3px)",
			pointerEvents: "none",
			userSelect: "none",
		};
	} else if (preset == "focus") {
		style = {
			opacity: "1",
			filter: "none",
			pointerEvents: "all",
			userSelect: "auto",
		};
	}
	Object.assign(element.style, style);
}

document.addEventListener("DOMContentLoaded", function () {
  var hotkey_dict: SettingsObj = {};
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
				Object.keys(items).forEach(function (key: string, index: number) {
					hotkey_dict[key] = items[key];
					if (typeof items[key] == "object") {
						const keyInput: HTMLInputElement | null = document.querySelector(`#${key}`);
						if (keyInput) {
							keyInput.value = dictToString(items[key]);
						}
          } else {
            const toggleInput = document.querySelector<HTMLInputElement>(`#${key}`);
            if (toggleInput) {
              toggleInput.checked = items[key];
            }
          }
					const toggleAllInput: HTMLInputElement | null = document.querySelector("#toggle");
					const buttonWrapElement: HTMLElement | null = document.querySelector("#button_wrap");
					if (!toggleAllInput || !buttonWrapElement) {
						throw new Error("Vital HTML elements not found. Please report this error.");
					}
					if (items["toggle"] == false) {
						toggleAllInput.checked = false;
						assignPresetStyle(buttonWrapElement, "unfocus");
					} else {
						toggleAllInput.checked = true;
						assignPresetStyle(buttonWrapElement, "focus");
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

	const readKeys = function (e: KeyboardEvent) {
		e.preventDefault();
		if (!e.target) {
			throw new Error("Event target cannot be null.");
		}
		var ctrl = e.ctrlKey ? "Ctrl + " : "";
		var alt = e.altKey ? "Alt + " : "";
		var shift = e.shiftKey ? "Shift + " : "";
		var character = !["Shift", "Alt", "Control"].includes(e.key) ? e.key : "None";
		var target = e.target as HTMLInputElement;
		if (e.key == "Escape") {
			target.value = "None";
			hotkey_dict[target.id as keyof SettingsObj] = "disabled";
		} else if (character != "None") {
			target.value = `${ctrl}${alt}${shift}${e.key.toUpperCase()}`;
			hotkey_dict[target.id] = {
				ctrl: e.ctrlKey,
				alt: e.altKey,
				shift: e.shiftKey,
				key: e.key,
				code: e.code,
			};
			//console.log(hotkey_dict[e.target.id]['code'])
		}
	};

	const responsiveChecks = function (e: MouseEvent) {
		let element = e.target as HTMLInputElement;
		let elem_id = element.id;
		hotkey_dict[elem_id] = element.checked;
		chrome.storage.local.set({ [elem_id]: element.checked });
		if (elem_id == "toggle") {
			switch_div();
		}
	};

	const switch_div = function () {
		const toggleInput: HTMLInputElement | null = document.querySelector("#toggle");
		const buttonWrapElement: HTMLElement | null = document.querySelector("#button_wrap");
		if (!toggleInput || !buttonWrapElement) {
			throw new Error("Vital HTML elements not found.");
		}
		hotkey_dict["toggle"] = toggleInput.checked;
		if (hotkey_dict["toggle"] == false) {
			assignPresetStyle(buttonWrapElement, "unfocus");
			chrome.storage.local.set({ toggle: false });
		} else {
			assignPresetStyle(buttonWrapElement, "focus");
			chrome.storage.local.set({ toggle: true });
		}
	};

	var buttons: NodeListOf<HTMLElement> = document.querySelectorAll(".option_edit");
	for (var item of buttons) {
		item.addEventListener("keydown", readKeys);
	}
	var checks = document.querySelectorAll<HTMLElement>(".option_check");
	for (let item of checks) {
		item.addEventListener("click", responsiveChecks);
	}
	const resetFormElement: HTMLElement | null = document.querySelector<HTMLElement>("#reset-form");
	const saveFormElement: HTMLElement | null = document.querySelector<HTMLElement>("#save-form");
	if (!resetFormElement || !saveFormElement) {
		throw new Error("Vital HTML elements not found.");
	}
	saveFormElement.addEventListener("click", saveSettings);
	resetFormElement.addEventListener("click", restoreSettings);
	restoreSettings();
});
