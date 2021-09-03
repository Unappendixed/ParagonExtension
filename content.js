'use strict';

// Associative array to hold user preferences
var hotkey_dict = {}

// Load user hotkeys into array.
chrome.storage.local.get({
	toggle: true,
	tabindex: false,
	addbuttons: false,
	maintain_context: false,
	cancellation_shortcut: false,
	brokerage_header: false,
	region_warning: true,
	save: { ctrl: true, alt: false, shift: false, key: 's', code: 'KeyS' },
	print: { ctrl: true, alt: false, shift: false, key: 'q', code: 'KeyQ' },
	search: { ctrl: true, alt: false, shift: true, key: 'F', code: 'KeyF' },
	expand: { ctrl: true, alt: false, shift: false, key: ']', code: 'BracketRight' },
	collapse: { ctrl: true, alt: false, shift: false, key: '[', code: 'BracketLeft' },
	goto_listings: { ctrl: false, alt: false, shift: false, key: 'F1', code: 'F1' },
	toggle_privacy: { ctrl: false, alt: false, shift: false, key: 'F2', code: 'F2' },
	close_tab: { ctrl: false, alt: true, shift: false, key: '\`', code: 'Backquote' },
	exp_calc: { ctrl: false, alt: false, shift: false, key: 'F3', code: 'F3' },
	goto_assume: { ctrl: false, alt: false, shift: false, key: 'F4', code: 'F4' }
}, function (items) {
	Object.keys(items).forEach(function (key, index) { hotkey_dict[key] = items[key] })
})

/** Checks whether paragon is commercial or residential.
 * @return {Boolean} True if commercial, false if residential.
 */
function isCommercial() {
	return document.location.hostname.split(".")[0] == "bccls"
}

/** Helper function for keybinding verification
 * @param {String} id hotkey_dict key to check key combination against
 * @param {Event} event Event object.
 * @return {Boolean} Returns true if the keypresses match user's keybinds, false otherwise.
 */
function keyMatch(id, event) {
	const areKeysDisabledGlobal = hotkey_dict['toggle'] == false;
	if (areKeysDisabledGlobal) {
		return false
	}
	const isKeyDisabled = hotkey_dict[id] == 'disabled';
	if (isKeyDisabled) {
		return false
	}
	const doesKeyMatch = event.ctrlKey == hotkey_dict[id]['ctrl'] &&
		event.altKey == hotkey_dict[id]['alt'] &&
		event.shiftKey == hotkey_dict[id]['shift'] &&
		event.code == hotkey_dict[id]['code'];
	if (doesKeyMatch) {
		return true
	} else {
		return false
	}
}

function numberPad(date) {
	let day = String(date.getDate())
	if (day.length == 1) {
		day = "0" + day
	}
	let month = String(date.getMonth() + 1)
	if (month.length == 1) {
		month = 0 + month
	}
	return `${month}/${day}/${date.getFullYear()}`
}

/** Helper function to find nested iframes. Recursive.
 * @param {object} start DOMElement to start searching from.
 * @param {object} target iframe element to search for.
 */
function getNestedFrame(start, target) {
	// Helper function that recursively loops through DOM, starting at <start>, searching for an
	// iframe that matches <target> css selector.
	var result;
	if (start.frames.length) {
		for (let ind = 0; ind < start.frames.length; ind++) {
			let i = start.frames[ind]
			if (i.frameElement.id == target) {
				result = i
			} else {
				if (i.frames.length > 0) {
					let temp_result = getNestedFrame(i, target)
					if (temp_result != false) {
						result = temp_result
					}
				}
			}
		}
		if (result) {
			return result
		} else {
			return false
		}
	}
}

// Recursively find elements through frames. Returns a list of elements matching the target CSS
// selector, starting from the target.
// BROKEN -- TODO
function getNestedElement(start, target) {
	console.log(start)
	var result_list = []
	for (let i of start.children) {
		let j = $(i)
		if (j.is(target)) {
			result_list.push(i)
		}
		if (j.is('iframe')) {
			let temp_result = getNestedElement(i.contentDocument, target)
			if (temp_result != false) {
				result_list = result_list.concat(temp_result)
			}
		}
		if (i.children.length > 0) {
			let temp_result = getNestedElement(i, target)
			if (temp_result != false) {
				result_list = result_list.concat(temp_result)
			}
		}
	}
	if (result_list.length > 1) {
		return result_list
	} else if (result_list.length == 1) {
		return result_list[0]
	} else {
		return false
	}
}

function getRootWindow(window, depth = 0) {
	if (!window) { return "Did not find window" }
	if (window.parent == window) {
		return window;
	} else if (depth > 20) {
		return null
	} else {
		depth++
		return getRootWindow(window.parent, depth);
	}
}

// function to create/invoke hidden iframe and print
function printReport() {
	// Creates an invisible iframe of the report view of the current listing and prints the
	// report. Only works on the listing maintenance screen, and the listing must already be
	// saved.
	var hidden_frame = document.querySelector("#print-frame") ?? false;
	if (hidden_frame) {
		hidden_frame.parentElement.removeChild(hidden_frame)
	}
	var listing_pane_window = getNestedFrame(window.top, 'listingFrame')
	if (listing_pane_window == false) {
		return
	}
	var listing_pane = listing_pane_window.frameElement
	var listing_id = listing_pane.src.match(/Listing\/(.*?)\?listing/)
	if (!listing_id) {
		alert("Can't print unsaved listing.")
		return
	}
	var iframe_src
	if (isCommercial()) {
		iframe_src = `https://bccls.paragonrels.com/ParagonLS/Reports/Report.mvc?listingIDs=${listing_id}&viewID=c144&usePDF=false`
	} else {
		iframe_src = `https://bcres.paragonrels.com/ParagonLS/Reports/Report.mvc?listingIDs=${listing_id}&viewID=c65&usePDF=false`
	}
	hidden_frame = document.createElement('iframe')
	hidden_frame.style.display = "none"
	hidden_frame.src = iframe_src
	hidden_frame.id = "print-frame"
	document.body.appendChild(hidden_frame)
	hidden_frame.contentWindow.print()
}

// Tweaks that need to intercept the DOM go here.
function dom_callback(mutation_list, observer) {
	const isBannerInMutationList = mutation_list.every((e) => e.target.id == 'app_banner_session');
	if (isBannerInMutationList) {
		return
	}
	let frame = getNestedFrame(window.top, 'listingFrame')

	if (!frame) { return } // guard clause
	let doc = frame.document

	// place constants here
	const canFindAreaField = doc.querySelector("#f_4") ?? false;
	const shouldWarnRegion = hotkey_dict["region_warning"];
	const shouldFixTabIndex = hotkey_dict['tabindex'];
	const shouldDisplayBrokerage = hotkey_dict['brokerage_header'];
	const canFindBrokerageField = doc.querySelector('#hdnf_28') ?? false;
	const shouldShowExpiryNextToCancellation = hotkey_dict['cancellation_shortcut'];
	const canFindCancellationField = doc.querySelector('#f_209') ?? false;
	const shouldShowRemoveBreakButtons = hotkey_dict['addbuttons'];

	disconnectObserver()
	if (shouldWarnRegion && canFindAreaField) {
		checkRegionAndWarn()
	}
	if (shouldFixTabIndex) {
		removeDatePickersFromTabIndex();
	}
	if (shouldDisplayBrokerage && canFindBrokerageField) {
		findAndDisplayBrokerage();
	}
	if (shouldShowExpiryNextToCancellation && canFindCancellationField) {
		showExpiryNextToCancellation();
	}
	if (shouldShowRemoveBreakButtons) {
		createRemoveBreakButtons()
	}
	reconnectObserver()

	function createRemoveBreakButtons() {
		let button = $('<button type="button" class="whitespace_button" tabindex="-1">Remove Breaks</button>');
		if ($(doc).find('.whitespace_button').length == 0) {
			var texts;
			switch (document.location.hostname.split(".")[0]) {
				case "bcres":
					texts = $(doc).find('#f_550, #f_551, #f_552');
					break;
				case "bccls":
					texts = $(doc).find('#f_554, #f_555');
					break;
			}
			for (let elem of texts) {
				let jelem = $(elem);
				let iter_button = button.clone();
				iter_button.attr('for', jelem.attr('id'));
				iter_button.click(function (e) {
					let text_elem = $(doc).find(`#${e.target.getAttribute('for')}`);
					let text = text_elem.prop('value');
					text = text.replace(/\n+/g, ' ');
					text_elem.prop('value', text);
				});
				jelem.before(iter_button);
			}
		}
	}

	function showExpiryNextToCancellation() {
		let expiry = doc.querySelector("#f_34").value;
		let canc;
		if (isCommercial()) {
			canc = doc.querySelector("#f_471").parentElement.parentElement;
		} else {
			canc = doc.querySelector('#f_209').parentElement.parentElement;
		}
		if (!canc.dataset.mod) {
			canc.innerHTML += `<span><i>Expiry: (${expiry})</i></span>`;
			canc.dataset.mod = "true";
		}
	}

	function findAndDisplayBrokerage() {
		let title = doc.querySelector(".f-pcnm-legend");
		if (!title.dataset.brokerage) {
			let json_string = doc.querySelector("#hdnf_28").value;
			title.dataset.brokerage = "true";
			title.innerHTML += " | " + JSON.parse(json_string)[0].Name;
		}
	}

	function reconnectObserver() {
		observer.observe(document, {
			attributes: false,
			childList: true,
			subtree: true
		});
	}

	function disconnectObserver() {
		observer.takeRecords();
		observer.disconnect();
	}

	function removeDatePickersFromTabIndex() {
		let pickers = doc.querySelectorAll('.datepick-trigger:not([tabindex="-1"])');
		pickers.forEach(function (e) {
			e.setAttribute('tabindex', '-1');
		});
	}

	function checkRegionAndWarn() {
		const boardAlias = { "F": "FVREB", "H": "CADREB", "N": "BCNREB" };
		let region = doc.querySelector("#f_4").parentElement.parentElement.firstElementChild.firstElementChild.firstElementChild;
		if (region) {
			if (boardAlias[region.innerHTML[0]] && !region.dataset.hasWarned) {
				alert(`Warning! This listing belongs to ${boardAlias[region.innerHTML[0]]}.\nYou can disable this warning in the extension settings.`);
				region.dataset.hasWarned = "true";
			}
		}
	}
}

// right click on listing grid to open actions
function mouse_callback(e) {
	const isListingMaintContextEnabled = hotkey_dict['maintain_context'];
	if (isListingMaintContextEnabled) {
		const isSelectedElementTableData = $(e.target).is('td');
		const canFindListingGrid = $('#gbox_grid').length > 0;
		if (isSelectedElementTableData && canFindListingGrid) {
			e.preventDefault()
			const clickMoreActions = $(e.target.parentNode).find('[aria-describedby="grid_Action"] > a')[0].click();
			clickMoreActions();
		}
	}
}

// All hotkeys wrapped in a callback.
// TODO - This block might benefit from increased modularity.
function key_callback(e) {
	// this log line to display hotkeys in console for debugging
	//console.log(`${e.ctrlKey}+${e.shiftKey}+${e.key} | ${e.code}`)

	// constants go here
	const shortcutIsExpand = keyMatch('expand', e);
	const shortcutIsSaveListing = keyMatch('save', e);
	const shortcutIsCollapse = keyMatch('collapse', e);
	const shortcutIsFocusSearch = keyMatch('search', e);
	const shortcutIsPrintListing = keyMatch('print', e);
	const shortcutIsGoToListingMaintenance = keyMatch('goto_listings', e);
	const shortcutIsTogglePrivacy = keyMatch('toggle_privacy', e);
	const shortcutIsCloseTab = keyMatch('close_tab', e);
	const shortcutIsCalculateCancellation = keyMatch('exp_calc', e);
	const shortcutIsGoToAssumeIdentity = keyMatch('goto_assume', e);

	if (shortcutIsExpand) {
		expandAll();
	}
	if (shortcutIsCollapse) {
		collapseAll();
	}
	if (shortcutIsFocusSearch) {
		focusPowerSearch();
	}
	if (shortcutIsPrintListing) {
		printListing();
	}
	if (shortcutIsSaveListing) {
		saveListing();
	}
	if (shortcutIsGoToListingMaintenance) {
		goToListingMaintenance();
	}
	if (shortcutIsTogglePrivacy) {
		togglePrivacy();
	}
	if (shortcutIsCloseTab) {
		closeTab();
	}
	if (shortcutIsCalculateCancellation) {
		calculateCancellation();
	}
	if (shortcutIsGoToAssumeIdentity) {
		goToAssumeIdentity();
	}
	function calculateCancellation() {
		e.preventDefault();
		let doc = getNestedFrame(window.top, 'listingFrame').document;
		let canc;
		let eff;
		if (isCommercial()) {
			canc = doc.querySelector("#f_471");
			eff = doc.querySelector("#f_211");
		} else {
			canc = doc.querySelector("#f_209");
			eff = doc.querySelector("#f_474");
		}
		if (eff.value.length == 10) {
			let eff_array = eff.value.split('/');
			eff_array.forEach((v, i) => { eff_array[i] = Number(v); });
			let eff_date = new Date(eff_array[2], eff_array[0] - 1, eff_array[1]);
			let new_date = eff_date;
			new_date.setDate(eff_date.getDate() + 59);
			//let new_date_string = `${new_date.getMonth() + 1}/${new_date.getDate()}/${new_date.getFullYear()}`
			let new_date_string = numberPad(new_date);
			// eff.innerHTML += `<span><i>+60 days: (${new_date_string})</i></span>`
			canc.value = new_date_string;
		}
	}

	function closeTab() {
		e.preventDefault();
		let lst = $(window.top.document).find('em[title="Close Tab"]:visible');
		lst[lst.length - 1].click();
	}

	function togglePrivacy() {
		e.preventDefault();
		var frame = getNestedFrame(window.top, 'listingFrame').document;
		var jframe = $(frame);
		var select;
		var name;
		switch (document.location.hostname.split(".")[0]) {
			case "bcres":
				select = $(frame).find('#f_214');
				name = $(frame).find('label[for="f_423"');
				break;
			case "bccls":
				select = $(frame).find('#f_217');
				name = $(frame).find('label[for="f_429"');
				break;
		}

		if (['N', ''].includes(select.prop('value'))) {
			select.prop('value', 'Y');
			name.addClass('privacy');

			jframe.find('.f-pcnm-legend').addClass('privacy-color');
		} else if (select.prop('value') == 'Y') {
			select.prop('value', '');
			name.removeClass('privacy');
			jframe.find('.f-pcnm-legend').removeClass('privacy-color');
		}
	}

	function goToListingMaintenance() {
		e.preventDefault();
		window.top.document.querySelector('#listings-nav').click();
		window.top.document.querySelector('#listings-nav + div').style.display = 'none';
		window.top.document.querySelector('#listings-nav + div a[fullWindow="False"]').click();
		window.top.document.querySelector('#listings-nav + div').style.display = 'block';
		try {
			window.top.document.querySelector('div#jGrowl').style.display = 'none';
		} catch { }
	}

	function saveListing() {
		if (getNestedFrame(window.top, 'listingFrame')) {
			e.preventDefault();
			getNestedFrame(window.top, 'listingFrame').document.querySelector('a#Save').click();

			// WIP code below to copy the ML# after saving.
			/*
			const dialog_watcher = new MutationObserver({$('td:contains("ML number")').select()})
			*/
		} else {
			console.log("Couldn't find listingFrame");
		}
	}

	function printListing() {
		e.preventDefault();
		if (getNestedFrame(window.top, "listingFrame")) {
			e.preventDefault();
			printReport();
		}
	}

	function focusPowerSearch() {
		e.preventDefault();
		let field = window.top.document.querySelector(".select2-search__field");
		field.click();
		field.select();
	}

	function collapseAll() {
		e.preventDefault();
		let target_frame = getNestedFrame(window.top, "listingFrame").document;
		if (target_frame != false && typeof target_frame != "undefined") {
			var close = target_frame.querySelector(".f-form-closeall");
			close.click();
		}
	}

	function expandAll() {
		let target_frame = getNestedFrame(window.top, 'listingFrame').document;
		if (target_frame != false && typeof target_frame != "undefined") {
			//console.log(target_frame)
			var open = target_frame.querySelector(".f-form-openall");
			open.click();
		}
	}

	function goToAssumeIdentity() {

		function focusFindField(window) {
			window.document.querySelector("#search_cd").focus();
		}
		var rootWindow = getRootWindow(window);
		var assume_menu_link = getRootWindow(window).document.querySelector("#lnkAssume");
		assume_menu_link.click();
		window.setTimeout(() => { focusFindField(window) }, 500)
	}
}

$(document).ready(function () {

	// injecting a few simple styles to reference in above functions
	var button_style = $(`<style>.whitespace_button {float:left;clear:left;display:inline-block;margin-left:120px;}</style>`)
	var privacy_style = $(`<style>.privacy {font-weight:bold;text-decoration:underline}.privacy-color {background:goldenrod}</style>`)
	$('head').append(button_style, privacy_style)

	// Event listener to execute callback on keypress
	document.onkeydown = key_callback

	document.oncontextmenu = mouse_callback

	// Mutation observer for automatic changes to DOM
	const observer = new MutationObserver(dom_callback)
	observer.observe(document, {
		attributes: false,
		childList: true,
		subtree: true
	})
});
