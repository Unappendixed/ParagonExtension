import { getNestedFrame } from "../utilities.js";
export default function saveListing(e: KeyboardEvent) {
  if (window.top === null) {
    throw new ReferenceError("top window element is null");
  }
  if (getNestedFrame(window.top, "listingFrame")) {
    e.preventDefault();
    const frame = getNestedFrame(window.top, "listingFrame");
    if (typeof frame === "boolean") {
      throw new ReferenceError("listing maintenance frame could not be found");
    }
    let doc = frame.contentDocument;
    if (doc !== null) {
      doc.querySelector<HTMLElement>("#Save")?.click();
    }
  }
}
