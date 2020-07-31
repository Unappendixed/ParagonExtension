$(document).ready(function() {

    var hotkey_dict = {}
    const restoreSettings = function() {

        const dictToString = function(dict) {
            var ctrl = dict["ctrl"] ? "Ctrl + " : ""
            var alt = dict['alt'] ? 'Alt + ' : ''
            var shift = dict["shift"] ? "Shift + " : ""
            var key = dict["key"].toUpperCase()
            return `${ctrl}${alt}${shift}${key}`
        }
        // add new settings here and they should cascade through the rest of the program.
        // make sure to use the DOM element ID for the key or it won't automatically register on the
        // control.
        chrome.storage.local.get({
            toggle: true,
            tabindex: false,
            addbuttons: false,
            maintain_context: false,
            save: {ctrl: true, alt:false, shift: false, key: 's', code: 'KeyS'},
            print: {ctrl: true, alt:false, shift: false, key: 'q', code: 'KeyQ'},
            search: {ctrl: true, alt:false, shift: true, key: 'F', code: 'KeyF'},
            expand: {ctrl: true, alt:false, shift: false, key: ']', code: 'BracketRight'},
            collapse: {ctrl: true, alt:false, shift: false, key: '[', code: 'BracketLeft'},
            goto_listings: {ctrl: false, alt:false, shift: false, key: 'F1', code:'F1'},
            toggle_privacy: {ctrl:false, alt:false, shift:false, key: 'F2', code:'F2'},
            close_tab: {ctrl: false, alt:true, shift:false, key: '\`', code: 'Backquote'}
        }, function(items) {
            Object.keys(items).forEach(function(key, index) {
                hotkey_dict[key] = items[key]
                if (typeof items[key] == 'object') {
                    document.querySelector(`#${key}`).value = dictToString(items[key])
                }
                if (items['toggle'] == false) {
                    $('#toggle-all').prop('checked',false)
                    $('#button_wrap').css({'opacity':0.2,'filter':'blur(3px)','pointer-events':'none', 'user-select': 'none'})
                } else {
                    $('#toggle-all').prop('checked', true)
                    $('#button_wrap').css({'opacity':1,'filter': 'none','pointer-events':'all','user-select':'auto'})
                } if (typeof items[key] == 'boolean') {
                    $(`#${key}`).prop('checked',hotkey_dict[key])
                    console.log(key, hotkey_dict[key])
                }
            })
        })
        console.log(hotkey_dict)
    }

    const saveSettings = function() {
        if (confirm("Save these hotkeys?")) {
            chrome.storage.local.set(hotkey_dict)
        }
    }

    const readKeys = function(e) {
        e.preventDefault()
        var ctrl = e.ctrlKey ? "Ctrl + " : ""
        var alt = e.altKey ? "Alt + " : ""
        var shift = e.shiftKey ? "Shift + " : ""
        var character = !['Shift', 'Alt','Control'].includes(e.key) ? e.key : "None"
        if (e.key == 'Escape') {
            e.target.value = "None"
            hotkey_dict[e.target.id] = 'disabled'
        } else if (character != "None") {
            e.target.value = `${ctrl}${alt}${shift}${e.key.toUpperCase()}`
            hotkey_dict[e.target.id] = {ctrl: e.ctrlKey, alt: e.altKey, shift: e.shiftKey, key: e.key, code: e.code}
            //console.log(hotkey_dict[e.target.id]['code'])
        }
    }

    const responsiveChecks = function(e) {
        let element = e.target
        let elem_id = element.id
        hotkey_dict[elem_id] = element.checked
        chrome.storage.local.set({[elem_id]: element.checked})
        if (elem_id == 'toggle') {switch_div()}

    }

    const switch_div = function() {
        hotkey_dict['toggle'] = document.querySelector('#toggle').checked
        if (hotkey_dict['toggle'] == false) {
            $('#button_wrap').css({'opacity':0.2,'filter':'blur(3px)','pointer-events':'none', 'user-select': 'none'})
            chrome.storage.local.set({toggle:false})
        } else {
            $('#button_wrap').css({'opacity':1,'filter': 'none', 'pointer-events':'all', 'user-select':'auto'})
            chrome.storage.local.set({toggle:true})
        }
    }

    var buttons = document.querySelectorAll('.option_edit')
    for (var item of buttons) {
        item.onkeydown = readKeys
    }
    var checks = document.querySelectorAll('.option_check')
    for (let item of checks) {
        item.onclick = responsiveChecks
    }
    document.querySelector('#reset-form').onclick = restoreSettings
    document.querySelector('#save-form').onclick = saveSettings
    restoreSettings()
    });
