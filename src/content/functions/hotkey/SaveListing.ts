function saveListing(e: KeyboardEvent) {
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
