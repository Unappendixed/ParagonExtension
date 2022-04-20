export type KeyDictionary = {
	ctrl: boolean;
	alt: boolean;
	shift: boolean;
	key: string;
};

export interface SettingsObj extends Object {
	toggle: boolean;
	tabindex: boolean;
	addbuttons: boolean;
	maintain_context: boolean;
	cancellation_shortcut: boolean;
	brokerage_header: boolean;
	region_warning: boolean;
	save: KeyDictionary;
	print: KeyDictionary;
	search: KeyDictionary;
	expand: KeyDictionary;
	collapse: KeyDictionary;
	goto_listings: KeyDictionary;
	toggle_privacy: KeyDictionary;
	close_tab: KeyDictionary;
	exp_calc: KeyDictionary;
	goto_assume: KeyDictionary;
};
