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
	exp_calc: { ctrl: false, alt: false, shift: false, key: 'F3', code: 'F3' }
}, function (items) {
	Object.keys(items).forEach(function (key, index) { hotkey_dict[key] = items[key] })
})


// Helper function for keybinding verification
const keyMatch = function (id, event) {
	if (hotkey_dict['toggle'] == false) {
		return false
	}
	if (hotkey_dict[id] == 'disabled') {
		return false
	}
	if (event.ctrlKey == hotkey_dict[id]['ctrl'] &&
		event.altKey == hotkey_dict[id]['alt'] &&
		event.shiftKey == hotkey_dict[id]['shift'] &&
		event.code == hotkey_dict[id]['code']) {
		return true
	} else {
		return false
	}
}

// helper function to find nested iframes
const frameFinder = function (start, target) {
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
					let temp_result = frameFinder(i, target)
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
function elemFinder(start, target) {
	console.log(start)
	var result_list = []
	for (let i of start.children) {
		let j = $(i)
		if (j.is(target)) {
			result_list.push(i)
		}
		if (j.is('iframe')) {
			let temp_result = elemFinder(i.contentDocument, target)
			if (temp_result != false) {
				result_list = result_list.concat(temp_result)
			}
		}
		if (i.children.length > 0) {
			let temp_result = elemFinder(i, target)
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

// function to create/invoke hidden iframe and print
const specialPrint = function () {
	// Creates an invisible iframe of the report view of the current listing and prints the
	// report. Only works on the listing maintenance screen, and the listing must already be
	// saved.
	var hidden_frame = document.querySelector("#print-frame")
	if (!hidden_frame) {
		var listing_pane_window = frameFinder(window.top, 'listingFrame')
		if (listing_pane_window == false) {
			return null
		}
		var listing_pane = listing_pane_window.frameElement
		var para_id = listing_pane.src.match(/Listing\/(.*?)\?listing/)
		if (para_id == null) {
			alert("Can't print unsaved listing.")
			return null
		}
		var domain = document.location.hostname.split(".")[0]
		var iframe_src
		if (domain == "bccls") {
			iframe_src = `https://bccls.paragonrels.com/ParagonLS/Reports/Report.mvc?listingIDs=${para_id}&viewID=c144&usePDF=false`
		} else if (domain == "bcres") {
			iframe_src = `https://bcres.paragonrels.com/ParagonLS/Reports/Report.mvc?listingIDs=${para_id}&viewID=c65&usePDF=false`
		}
		hidden_frame = document.createElement('iframe')
		hidden_frame.style.display = "none"
		hidden_frame.src = iframe_src
		hidden_frame.id = "print-frame"
		document.body.appendChild(hidden_frame)
	} else {
		hidden_frame.contentWindow.location.reload()
	}
	hidden_frame.contentWindow.print()
}

// Tweaks that need to intercept the DOM go here.
var dom_callback = function (list, observer) {
	// below excludes the app banner refresh from DOM observer calls
	if (list.every((e) => {
		return e.target.id == 'app_banner_session'
	})) {
		return
	}
	// we only want these to take effect while the listing iframe is loaded
	let frame = frameFinder(window.top, 'listingFrame')
	let doc = frame.document
	if (frame) {
		// Warn user if the listing they've opened is not a REBGV listing.
		if (hotkey_dict["region_warning"] && doc.querySelector("#f_4")) {
			observer.takeRecords()
			observer.disconnect()
			const boardAlias = {"F" : "FVREB", "H": "CADREB", "N": "BCNREB"}
			let region = doc.querySelector("#f_4").parentElement.parentElement.firstElementChild.firstElementChild.firstElementChild
			if (region) {
				if (boardAlias[region.innerHTML[0]] && !region.dataset.hasWarned) {
					alert(`Warning! This listing belongs to ${boardAlias[region.innerHTML[0]]}.\nYou can disable this warning in the extension settings.`)
					region.dataset.hasWarned = "true"
				}
			}
			observer.observe(document, {
				attributes: false,
				childList: true,
				subtree: true
			})
		}
		// Remove date pickers from tab index
		if (hotkey_dict['tabindex'] == true) {
			observer.takeRecords()
			observer.disconnect()
			// let frame = frameFinder(window.top, 'listingFrame').document
			// remove date pickers from tab index
			let pickers = doc.querySelectorAll('.datepick-trigger:not([tabindex="-1"])')
			pickers.forEach(function (e) {
				e.setAttribute('tabindex', '-1')
			})
			observer.observe(document, {
				attributes: false,
				childList: true,
				subtree: true
			})
		}
		// Add brokerage name to the header for easier amendment processing.
		if (hotkey_dict['brokerage_header'] && doc.querySelector('#hdnf_28')) {
			observer.takeRecords()
			observer.disconnect()

			let title = doc.querySelector(".f-pcnm-legend")
			if (!title.dataset.brokerage) {
				let json_string = doc.querySelector("#hdnf_28").value
				title.dataset.brokerage = "true"
				title.innerHTML += " | " + JSON.parse(json_string)[0].Name
			}

			observer.observe(document, {
				attributes: false,
				childList: true,
				subtree: true
			})
		}
		// Displays the expiration of the contract next to the cancellation
		// expiration date for quicker cancellation processing.
		if (hotkey_dict['cancellation_shortcut'] && doc.querySelector('#f_209')) {
			observer.takeRecords()
			observer.disconnect()

			let expiry = doc.querySelector("#f_34").value
			let canc = doc.querySelector('#f_209').parentElement.parentElement
			if (!canc.dataset.mod) {
				canc.innerHTML += `<span><i>Expiry: (${expiry})</i></span>`
				canc.dataset.mod = "true"
			}
			observer.observe(document, {
				attributes: false,
				childList: true,
				subtree: true
			})
		}
		// Add function buttons to DOM
		if (hotkey_dict['addbuttons'] == true) {
			observer.takeRecords()
			observer.disconnect()
			let button = $('<button type="button" class="whitespace_button" tabindex="-1">Remove Breaks</button>')
			if ($(doc).find('.whitespace_button').length == 0) {
				var texts;
				switch (document.location.hostname.split(".")[0]) {
					case "bcres":
						texts = $(doc).find('#f_550, #f_551, #f_552')
						break;
					case "bccls":
						texts = $(doc).find('#f_554, #f_555')
						break;
				}
				for (let elem of texts) {
					let jelem = $(elem)
					let iter_button = button.clone()
					iter_button.attr('for', jelem.attr('id'))
					iter_button.click(function (e) {
						let text_elem = $(doc).find(`#${e.target.getAttribute('for')}`)
						let text = text_elem.prop('value')
						text = text.replace(/\n+/g, ' ')
						text_elem.prop('value', text)
					})
					jelem.before(iter_button)
				}
			}
			observer.observe(document, {
				attributes: false,
				childList: true,
				subtree: true
			})
		}

	}
}

// right click on listing grid to open actions
var mouse_callback = function (e) {
	if (hotkey_dict['maintain_context']) {
		if ($(e.target).is('td') && $('#gbox_grid').length > 0) {
			e.preventDefault()
			console.log($(e.target.parentNode).find('[aria-describedby="grid_Action"] > a'))
			$(e.target.parentNode).find('[aria-describedby="grid_Action"] > a')[0].click()
			//$(e.target.parentNode).find('[aria-describedby="grid_Action"]').children().click()
		}
	}
}

// All hotkeys wrapped in a callback.
var key_callback = function (e) {
	// this log line to display hotkeys in console for debugging
	//console.log(`${e.ctrlKey}+${e.shiftKey}+${e.key} | ${e.code}`)

	// Ctrl+] to expand all containers
	if (keyMatch('expand', e)) {
		let target_frame = frameFinder(window.top, 'listingFrame').document
		if (target_frame != false && typeof target_frame != "undefined") {
			//console.log(target_frame)
			var open = target_frame.querySelector(".f-form-openall")
			open.click()
		}
	}

	// Ctrl+[ to collapse all containers
	if (keyMatch('collapse', e)) {
		e.preventDefault()
		let target_frame = frameFinder(window.top, "listingFrame").document
		if (target_frame != false && typeof target_frame != "undefined") {
			var close = target_frame.querySelector(".f-form-closeall")
			close.click()
		}
	}

	// Ctrl+Shift+F to focus the Power Search bar
	if (keyMatch('search', e)) {
		e.preventDefault()
		let field = window.top.document.querySelector(".select2-search__field")
		field.click()
		field.select()
	}

	// Ctrl+Q to print/download the current listing
	if (keyMatch('print', e)) {
		e.preventDefault()
		if (frameFinder(window.top, "listingFrame")) {
			e.preventDefault()
			specialPrint()
		}
	}

	// Ctrl+S to save listing
	if (keyMatch('save', e)) {
		if (frameFinder(window.top, 'listingFrame')) {
			e.preventDefault()
			frameFinder(window.top, 'listingFrame').document.querySelector('a#Save').click()

			// WIP code below to copy the ML# after saving.
			/*
			const dialog_watcher = new MutationObserver({$('td:contains("ML number")').select()})
			*/
		} else {
			console.log("Couldn't find listingFrame")
		}
	}

	// F1 to open the Listing tab. Limited functionality.
	if (keyMatch('goto_listings', e)) {
		e.preventDefault()
		window.top.document.querySelector('#listings-nav').click()
		//$('#listings-nav').click()
		window.top.document.querySelector('#listings-nav + div').style.display = 'none'
		//$('#listings-nav + div').css('display','none')
		window.top.document.querySelector('#listings-nav + div a[fullWindow="False"]').click()
		//$('#listings-nav + div').css('display', 'block')
		window.top.document.querySelector('#listings-nav + div').style.display = 'block'
		//$('div#jGrowl').hide()
		try {
			window.top.document.querySelector('div#jGrowl').style.display = 'none'
		} catch { }
	}

	// F2 to toggle privacy protection dropdown on a listing. Visual feedback still WIP.
	if (keyMatch('toggle_privacy', e)) {
		e.preventDefault()
		var frame = frameFinder(window.top, 'listingFrame').document
		var jframe = $(frame)
		var select
		var name
		switch (document.location.hostname.split(".")[0]) {
			case "bcres":
				select = $(frame).find('#f_214')
				name = $(frame).find('label[for="f_423"')
				break;
			case "bccls":
				select = $(frame).find('#f_217')
				name = $(frame).find('label[for="f_429"')
				break;
		}

		if (['N', ''].includes(select.prop('value'))) {
			select.prop('value', 'Y')
			//flashTitle('Privacy Enabled')
			//jframe.find('span:contains("Marketing Instructions")').click()
			//alert("Privacy Enabled")
			name.addClass('privacy')

			jframe.find('.f-pcnm-legend').addClass('privacy-color')
		} else if (select.prop('value') == 'Y') {
			select.prop('value', '')
			//flashTitle('Privacy Disabled')
			//jframe.find('span:contains("Marketing Instructions")').click()
			//alert("Privacy Enabled")
			name.removeClass('privacy')
			jframe.find('.f-pcnm-legend').removeClass('privacy-color')
		}
	}

	// Shortcut to close tabs, starting with the current, most deeply nested tab
	if (keyMatch('close_tab', e)) {
		e.preventDefault()
		let jframe = $(frameFinder(window.top, 'listingFrame'))
		let lst = $(window.top.document).find('em[title="Close Tab"]:visible')
		lst[lst.length - 1].click()

	}

	// Shortcut to calculate 60 days from the cancel effective date and place
	// the value in the cancellation expiry date.
	if (keyMatch('exp_calc', e)) {
		e.preventDefault()
		let doc = frameFinder(window.top, 'listingFrame').document
		let eff = doc.querySelector("#f_474").parentElement.parentElement
		let exp = doc.querySelector("#f_474")
		if (exp.value.length == 10) {
			let eff_array = exp.value.split('/')
			eff_array.forEach((v, i) => { eff_array[i] = Number(v) })
			let eff_date = new Date(eff_array[2], eff_array[0] - 1, eff_array[1])
			let new_date = eff_date
			new_date.setDate(eff_date.getDate() + 59)
			let new_date_string = `${new_date.getMonth() + 1}/${new_date.getDate()}/${new_date.getFullYear()}`
			// eff.innerHTML += `<span><i>+60 days: (${new_date_string})</i></span>`
			doc.querySelector("#f_209").value = new_date_string
		}
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
