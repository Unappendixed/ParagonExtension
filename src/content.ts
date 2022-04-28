type KeyDictionary = {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
  code: string;
};

type OptionalKeyDictionary =  KeyDictionary | 'disabled';

type OptionalBoolean = boolean | 'disabled';

type SettingsObj = {
  [key: string]: boolean | KeyDictionary | 'disabled'
};


("use strict");

// Associative array to hold user preferences
var hotkey_dict: SettingsObj = {};

// Load user hotkeys into array.
chrome.storage.local.get(
  {
    toggle: true,
    tabindex: false,
    addbuttons: false,
    maintain_context: false,
    cancellation_shortcut: false,
    brokerage_header: false,
    region_warning: true,
    save: { ctrl: true, alt: false, shift: false, key: "s", code: "KeyS" },
    print: { ctrl: true, alt: false, shift: false, key: "q", code: "KeyQ" },
    search: { ctrl: true, alt: false, shift: true, key: "F", code: "KeyF" },
    expand: { ctrl: true, alt: false, shift: false, key: "]", code: "BracketRight" },
    collapse: { ctrl: true, alt: false, shift: false, key: "[", code: "BracketLeft" },
    goto_listings: { ctrl: false, alt: false, shift: false, key: "F1", code: "F1" },
    toggle_privacy: { ctrl: false, alt: false, shift: false, key: "F2", code: "F2" },
    close_tab: { ctrl: false, alt: true, shift: false, key: "`", code: "Backquote" },
    exp_calc: { ctrl: false, alt: false, shift: false, key: "F3", code: "F3" },
    goto_assume: { ctrl: false, alt: false, shift: false, key: "F4", code: "F4" },
  },
  function (items) {
    Object.keys(items).forEach(function (key, index) {
      hotkey_dict[key] = items[key];
    });
  }
);

/** Checks whether paragon is commercial or residential.
 * @return {Boolean} True if commercial, false if residential.
 */
function isCommercial() {
  return document.location.hostname.split(".")[0] == "bccls";
}

/** Helper function for keybinding verification
 * @param {String} id hotkey_dict key to check key combination against
 * @param {Event} event Event object.
 * @return {Boolean} Returns true if the keypresses match user's keybinds, false otherwise.
 */
function keyMatch(id: string, event: KeyboardEvent) {
  const settings_id = id as keyof SettingsObj;
  const areKeysDisabledGlobal = hotkey_dict["toggle"] == false;
  if (areKeysDisabledGlobal) {
    return false;
  }
  const isKeyDisabled = hotkey_dict[id as keyof SettingsObj] === "disabled";
  if (isKeyDisabled) {
    return false;
  }
  const currentHotkey = hotkey_dict[settings_id];
  if (typeof currentHotkey == "boolean" || typeof currentHotkey == "string") {
    return null;
  }
  const doesKeyMatch =
    event.ctrlKey == currentHotkey.ctrl &&
    event.altKey == currentHotkey.alt &&
    event.shiftKey == currentHotkey.shift &&
    event.code == currentHotkey.code;
  if (doesKeyMatch) {
    return true;
  } else {
    return false;
  }
}

function numberPad(date: Date) {
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
function getNestedFrame(start: Window, target: string): HTMLIFrameElement | boolean {
  // Helper function that recursively loops through DOM, starting at <start>, searching for an
  // iframe that matches <target> css selector.
  var result;
  if (start.frames.length) {
    for (let ind = 0; ind < start.frames.length; ind++) {
      let i = start.frames[ind];
      if (i.frameElement === null) {
        throw new Error("Index out of range");
      }
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

function getRootWindow(window: Window, depth: number = 0): Window | boolean {
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
function printReport() {
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

// Tweaks that need to intercept the DOM go here.
function domCallback(mutationList: MutationRecord[], observer: MutationObserver) {
  if (window.top === null) {
    throw new ReferenceError("the sky is falling");
  }
  const isBannerInMutationList = mutationList.every((e) => (e.target as HTMLElement).id == "app_banner_session");
  if (isBannerInMutationList) {
    return;
  }
  let frame = getNestedFrame(window.top, "listingFrame");

  if (typeof frame === 'boolean') {
    return;
  } // guard clause
  let doc = frame.contentDocument;
  if (doc === null) {
    return;
  }

  // place constants here
  const canFindAreaField = doc.querySelector("#f_4") ?? false;
  const shouldWarnRegion = hotkey_dict["region_warning"];
  const shouldFixTabIndex = hotkey_dict["tabindex"];
  const shouldDisplayBrokerage = hotkey_dict["brokerage_header"];
  const canFindBrokerageField = doc.querySelector("#hdnf_28") ?? false;
  const shouldShowExpiryNextToCancellation = hotkey_dict["cancellation_shortcut"];
  const canFindCancellationField = doc.querySelector("#f_209") ?? false;
  const shouldShowRemoveBreakButtons = hotkey_dict["addbuttons"];

  disconnectObserver();
  if (shouldWarnRegion && canFindAreaField) {
    checkRegionAndWarn(doc);
  }
  if (shouldFixTabIndex) {
    removeDatePickersFromTabIndex(doc);
  }
  if (shouldDisplayBrokerage && canFindBrokerageField) {
    findAndDisplayBrokerage(doc);
  }
  if (shouldShowExpiryNextToCancellation && canFindCancellationField) {
    showExpiryNextToCancellation(doc);
  }
  if (shouldShowRemoveBreakButtons) {
    createRemoveBreakButtons(doc);
  }
  reconnectObserver();

  //FIXME currently doesn't work because listingFrame isn't available
  // for some reason
  function createRemoveBreakButtons(doc: Document) {
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("class", "whitespace-button");
    button.setAttribute("tabindex", "-1");
    button.textContent = "Remove Breaks";

    const existingWhitespaceButton = doc.querySelectorAll<HTMLElement>(".whitespace-button").length == 0;
    if (existingWhitespaceButton) {
      var texts: NodeListOf<HTMLElement>;
      switch (document.location.hostname.split(".")[0]) {
        case "bcres":
          texts = doc.querySelectorAll<HTMLElement>("#f_550, #f_551, #f_552");
          break;
        case "bccls":
          texts = doc.querySelectorAll<HTMLElement>("#f_554, #f_555");
          break;
        default:
          return;
      }
      for (let elem of texts) {
        let iter_button: HTMLElement = button.cloneNode() as HTMLElement;
        iter_button.setAttribute("for", elem.id);
        iter_button.addEventListener("click", function (args: MouseEvent) {
          if (doc === null) {
            throw new ReferenceError("Listing maintenance iframe is null");
          }
          let text_elem = doc.querySelector<HTMLElement>(`#${(args.target as HTMLElement).getAttribute("for")}`);
          if (text_elem === null) {
            throw new ReferenceError("Can't find text box connected to clicked button.");
          }
          let text = text_elem.getAttribute("value");
          if (text) {
            text = text.replace(/\n+/g, " ");
            text_elem.setAttribute("value", text);
          }
        });
        elem.before(iter_button);
      }
    }
  }

  function showExpiryNextToCancellation(doc: Document) {
    let expiryElement = doc.querySelector<HTMLInputElement>("#f_34");
    if (expiryElement === null) {
      return;
    }
    const expiry = expiryElement.value;
    var canc;
    if (isCommercial()) {
      canc = doc.querySelector("#f_471")?.parentElement?.parentElement;
    } else {
      canc = doc.querySelector("#f_209")?.parentElement?.parentElement;
    }
    if (canc === null || canc === undefined) {
      throw new ReferenceError("Cancellation date field not found.");
    }
    if (!canc.dataset.mod) {
      canc.innerHTML += `<span><i>Expiry: (${expiry})</i></span>`;
      canc.dataset.mod = "true";
    }
  }

  function findAndDisplayBrokerage(doc: Document) {
    let title = doc.querySelector<HTMLElement>(".f-pcnm-legend");
    if (title === null) {
      throw new ReferenceError("Frame header not found.");
    }
    if (!title.dataset.brokerage) {
      let json_string = doc.querySelector<HTMLInputElement>("#hdnf_28")?.value;
      if (json_string === undefined) {
        throw new ReferenceError("Unable to get brokerage name.");
      }
      title.dataset.brokerage = "true";
      title.innerHTML += " | " + JSON.parse(json_string)[0].Name;
    }
  }

  function reconnectObserver() {
    observer.observe(document, {
      attributes: false,
      childList: true,
      subtree: true,
    });
  }

  function disconnectObserver() {
    observer.takeRecords();
    observer.disconnect();
  }

  function removeDatePickersFromTabIndex(doc: Document) {
    let pickers = doc.querySelectorAll('.datepick-trigger:not([tabindex="-1"])');
    pickers.forEach(function (e) {
      e.setAttribute("tabindex", "-1");
    });
  }

  function checkRegionAndWarn(doc: Document) {
    const boardAlias = { F: "FVREB", H: "CADREB", N: "BCNREB" };
    let region = doc.querySelector<HTMLElement>("#f_4")?.parentElement?.parentElement?.firstElementChild
      ?.firstElementChild?.firstElementChild as HTMLElement;
    if (region) {
      if (boardAlias[region.innerHTML[0] as keyof Object] && !region.dataset.hasWarned) {
        alert(
          `Warning! This listing belongs to ${
            boardAlias[region.innerHTML[0] as keyof Object]
          }.\nYou can disable this warning in the extension settings.`
        );
        region.dataset.hasWarned = "true";
      }
    }
  }
}

// right click on listing grid to open actions
function mouseCallback(e: MouseEvent) {
  const source = e.target as HTMLElement;
  const isListingMaintContextEnabled = hotkey_dict["maintain_context"];
  if (isListingMaintContextEnabled) {
    const isSelectedElementTableData = source.tagName === "TD";
    const canFindListingGrid = document.querySelectorAll("#gbox_grid").length > 0;
    if (isSelectedElementTableData && canFindListingGrid) {
      e.preventDefault();
      const parent = source.parentElement as HTMLElement;
      const target = parent.querySelector<HTMLElement>('[aria-describedby="grid_Action"] > a');
      if (target) {
        target.click();
      }
    }
  }
}

// All hotkeys wrapped in a callback.
// TODO - This block might benefit from increased modularity.
function keyCallback(e: KeyboardEvent) {
  // this log line to display hotkeys in console for debugging
  //console.log(`${e.ctrlKey}+${e.shiftKey}+${e.key} | ${e.code}`)

  // constants go here
  const shortcutIsExpand = keyMatch("expand", e);
  const shortcutIsSaveListing = keyMatch("save", e);
  const shortcutIsCollapse = keyMatch("collapse", e);
  const shortcutIsFocusSearch = keyMatch("search", e);
  const shortcutIsPrintListing = keyMatch("print", e);
  const shortcutIsGoToListingMaintenance = keyMatch("goto_listings", e);
  const shortcutIsTogglePrivacy = keyMatch("toggle_privacy", e);
  const shortcutIsCloseTab = keyMatch("close_tab", e);
  const shortcutIsCalculateCancellation = keyMatch("exp_calc", e);
  const shortcutIsGoToAssumeIdentity = keyMatch("goto_assume", e);

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
    if (window.top === null) {
      throw new ReferenceError("The top window is null... somehow");
    }
    let doc = getNestedFrame(window.top, "listingFrame");
    if (typeof doc === "boolean") {
      throw new ReferenceError("Listing maintenance frame cannot be null");
    }
    let canc: HTMLInputElement | null;
    let eff: HTMLInputElement | null;
    if (isCommercial()) {
      canc = doc.querySelector("#f_471");
      eff = doc.querySelector("#f_211");
    } else {
      canc = doc.querySelector("#f_209");
      eff = doc.querySelector("#f_474");
    }
    if (eff === null || canc === null) {
      throw new ReferenceError("Couldn't get effective cancellation date field.");
    }
    if (eff?.value.length == 10) {
      let effArrayStrings: string[] = eff.value.split("/");
      let effArrayNums: number[] = [];
      effArrayStrings.forEach((v, i) => {
        effArrayNums[i] = Number(v);
      });
      let eff_date = new Date(effArrayNums[2], effArrayNums[0] - 1, effArrayNums[1]);
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
    if (window.top === null) {
      throw new ReferenceError("top window not found i guess");
    }
    let lst: NodeListOf<HTMLElement> = window.top.document.querySelectorAll<HTMLElement>(
      'em[title="Close Tab"]:visible'
    );
    lst[lst.length - 1].click();
  }

  function togglePrivacy() {
    e.preventDefault();
    if (window.top === null) {
      throw new ReferenceError("window.top is null");
    }
    var frame = getNestedFrame(window.top, "listingFrame");
    if (typeof frame === "boolean") {
      throw new ReferenceError("Failed to find nested listing frame element.");
    }
    var select: HTMLInputElement | null = null;
    var name: HTMLInputElement | null = null;
    switch (document.location.hostname.split(".")[0]) {
      case "bcres":
        select = frame.querySelector<HTMLInputElement>("#f_214");
        name = frame.querySelector('label[for="f_423"');
        break;
      case "bccls":
        select = frame.querySelector<HTMLInputElement>("#f_217");
        name = frame.querySelector('label[for="f_429"');
        break;
    }

    if (select === null || select === undefined) {
      throw new ReferenceError("privacy toggle element could not be found");
    }
    if (name === null) {
      throw new ReferenceError("owner name field element could not be found");
    }

    if (["N", ""].includes(select.value)) {
      select.setAttribute("value", "Y");
      name.classList.add("privacy");

      frame.querySelector(".f-pcnm-legend")?.setAttribute("class", "privacy-color");
    } else if (select.getAttribute("value") == "Y") {
      select.setAttribute("value", "");
      name.classList.remove("privacy");
    }
  }

  function goToListingMaintenance() {
    e.preventDefault();
    if (window.top === null) {
      throw new ReferenceError("Top window is null");
    }
    const targetDocument = window.top.document;
    targetDocument.querySelector<HTMLElement>("#listings-nav")?.click();
    const navElement = targetDocument.querySelector<HTMLElement>("#listings-nav + div");
    if (navElement === null) {
      throw new ReferenceError("Navigation element could not be found");
    }
    navElement.style.display = "none";
    targetDocument.querySelector<HTMLElement>('#listings-nav + div a[fullWindow="False"]')?.click();
    navElement.style.display = "block";
    try {
      const growlElement = targetDocument.querySelector<HTMLElement>("div#jGrowl");
      if (growlElement === null) {
        return;
      }
      growlElement.style.display = "none";
    } catch {}
  }

  function saveListing() {
    if (window.top === null) {
      throw new ReferenceError("top window element is null");
    }
    if (getNestedFrame(window.top, "listingFrame")) {
      e.preventDefault();
      const frame = getNestedFrame(window.top, "listingFrame");
      if (!(frame instanceof HTMLIFrameElement)) {
        throw new ReferenceError("listing maintenance frame could not be found");
      }
      frame.querySelector<HTMLElement>("a#Save")?.click();

      // WIP code below to copy the ML# after saving.
      /*
      const dialog_watcher = new MutationObserver({$('td:contains("ML number")').select()})
      */
    }
  }

  function printListing() {
    e.preventDefault();
    if (window.top === null) {
      throw new ReferenceError("top window element could not be found");
    }
    if (getNestedFrame(window.top, "listingFrame")) {
      e.preventDefault();
      printReport();
    }
  }

  function focusPowerSearch() {
    e.preventDefault();
    if (window.top === null) {
      throw new ReferenceError("top window element could not be found");
    }
    let field = window.top.document.querySelector<HTMLElement>(".select2-search__field");
    field?.click();
    field?.focus();
  }

  function collapseAll() {
    e.preventDefault();
    if (window.top === null) {
      throw new ReferenceError("top window is null");
    }
    let targetFrame = getNestedFrame(window.top, "listingFrame");
    if (targetFrame instanceof HTMLIFrameElement) {
      var close = targetFrame.querySelector<HTMLElement>(".f-form-closeall");
      close?.click();
    }
  }

  function expandAll() {
    if (window.top === null) {
      throw new ReferenceError("top window element is null");
    }
    let targetFrame = getNestedFrame(window.top, "listingFrame");
    if (typeof targetFrame !== 'boolean') {
      //console.log(target_frame)
      var open = targetFrame.querySelector<HTMLElement>(".f-form-openall");
      open?.click();
    }
  }

  function goToAssumeIdentity() {
    function focusFindField(window: Window) {
      try {
        window?.document?.querySelector<HTMLElement>("#search_cd")?.focus();
      } catch (e: any) {
        if (!(e instanceof TypeError)) {
          throw e;
        }
      }
    }
    var rootWindow = getRootWindow(window);
    var rootDocument: Document | null = null;
    if (typeof rootWindow != 'boolean' && 'document' in rootWindow) {
      rootDocument = rootWindow.document;
    }
    var assumeMenuLink: HTMLElement | null = null;
    if (rootDocument !== null) assumeMenuLink = rootDocument.querySelector("#lnkAssume");
    assumeMenuLink?.click();
    window.setTimeout(() => {
      focusFindField(window);
    }, 1000);
  }
}

window.addEventListener("load", function () {
  // injecting a few simple styles to reference in above functions
  const inlineStyles = document.createElement("style");
  const buttonStyle = `.whitespace_button {float:left;clear:left;display:inline-block;margin-left:120px;}`;
  const privacyStyle = `.privacy {font-weight:bold;text-decoration:underline}.privacy-color {background:goldenrod}`;

  inlineStyles.innerText = buttonStyle + privacyStyle;

  document.querySelector("head")?.append(inlineStyles);

  // Event listener to execute callback on keypress
  document.onkeydown = keyCallback;

  document.oncontextmenu = mouseCallback;

  // Mutation observer for automatic changes to DOM
  const observer = new MutationObserver(domCallback);
  observer.observe(document, {
    attributes: false,
    childList: true,
    subtree: true,
  });
});
