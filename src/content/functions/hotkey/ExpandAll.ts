function collapseAll(e: KeyboardEvent) {
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
