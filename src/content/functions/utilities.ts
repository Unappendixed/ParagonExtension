import { KeyDictionary, OptionDictionary } from './../types';

export function isCommercial() {
  return document.location.hostname.split(".")[0] == "bccls";
}

/** Helper function for keybinding verification
  * @param {KeyDictionary} keyObj Object representing configuration for a particular feature
 * @param {Event} event Event object.
 * @return {Boolean} Returns true if the keypresses match user's keybinds, false otherwise.
 */
export function keyMatch(keyObj: KeyDictionary, event: KeyboardEvent) {
  // const areKeysDisabledGlobal = hotkey_dict["toggle"] == false;
  // if (areKeysDisabledGlobal) {
  //   return false;
  // }
  let keyConfig = keyObj.config;
  if (!keyObj.config.enabled) {
    return false;
  }
  // if (typeof currentHotkey == "boolean" || typeof currentHotkey == "string") {
  //   return null;
  // }
  const doesKeyMatch =
    event.ctrlKey == keyConfig.ctrl &&
    event.altKey == keyConfig.alt &&
    event.shiftKey == keyConfig.shift &&
    event.code == keyConfig.code;
  return doesKeyMatch;
}

export function numberPad(date: Date) {
  let day = String(date.getDate());
  if (day.length == 1) {
    day = "0" + day;
  }
  let month = String(date.getMonth() + 1);
  if (month.length == 1) {
    month = 0 + month;
  }
  return `${month}/${day}/${date.getFullYear()}`;
}

/** Helper function to find nested iframes. Recursive.
 * @param {Window} start DOMElement to start searching from.
 * @param {string} target the id of the iframe element to search for.
 */
export function getNestedFrame(start: Window, target: string): HTMLIFrameElement | boolean {
  // Helper function that recursively loops through DOM, starting at <start>, searching for an
  // iframe that matches <target> css selector.
  var result;
  if (start.frames.length) {
    for (let ind = 0; ind < start.frames.length; ind++) {
      let i = start.frames[ind];
      try {
        if (i.frameElement === null) {
          return false;
        }
      } catch (e) { return false } // squelch errors when traversing non Paragon frames
      if (i.frameElement.id == target) {
        result = i.frameElement as HTMLIFrameElement;
      } else {
        if (i.frames.length > 0) {
          let temp_result = getNestedFrame(i, target);
          if (temp_result != false) {
            result = temp_result;
          }
        }
      }
    }
    if (result) {
      return result;
    }
  }
  return false;
}

export function getRootWindow(window: Window, depth: number = 0): Window | boolean {
  if (!window) {
    return false;
  }
  if (window.parent == window) {
    return window;
  } else if (depth > 20) {
    return false;
  } else {
    depth++;
    return getRootWindow(window.parent, depth);
  }
}

// function to create/invoke hidden iframe and print
export function printReport() {
  // Creates an invisible iframe of the report view of the current listing and prints the
  // report. Only works on the listing maintenance screen, and the listing must already be
  // saved.
  var hidden_frame: HTMLIFrameElement | null;
  hidden_frame = document.querySelector<HTMLIFrameElement>("#print-frame");
  if (hidden_frame && hidden_frame.parentElement) {
    hidden_frame.parentElement.removeChild(hidden_frame);
  }
  if (window.top === null) {
    throw new ReferenceError("I literally don't know how it's possible for this error to be reached, so... good job.");
  }
  var listing_pane = getNestedFrame(window.top, "listingFrame");
  if (listing_pane == false || typeof listing_pane == "boolean") {
    throw new ReferenceError("Failed to find listing maintenance iFrame");
  }
  var listing_id = listing_pane.src.match(/Listing\/(.*?)\?listing/);
  if (!listing_id) {
    alert("Can't print unsaved listing.");
    return;
  }
  var iframe_src;
  if (isCommercial()) {
    iframe_src = `https://bccls.paragonrels.com/ParagonLS/Reports/Report.mvc?listingIDs=${listing_id}&viewID=c144&usePDF=false`;
  } else {
    iframe_src = `https://bcres.paragonrels.com/ParagonLS/Reports/Report.mvc?listingIDs=${listing_id}&viewID=c65&usePDF=false`;
  }
  hidden_frame = document.createElement("iframe");
  hidden_frame.style.display = "none";
  hidden_frame.src = iframe_src;
  hidden_frame.id = "print-frame";
  document.body.appendChild(hidden_frame);
  if (!hidden_frame.contentWindow) {
    throw new ReferenceError("Failed to access hidden iframe's content window.");
  }
  hidden_frame.contentWindow.print();
}

export function reconnectObserver(observer: MutationObserver, doc: Document) {
  observer.observe(document, {
    attributes: false,
    childList: true,
    subtree: true,
  });
}

export function disconnectObserver(observer: MutationObserver, doc: Document) {
  observer.takeRecords();
  observer.disconnect();
}
