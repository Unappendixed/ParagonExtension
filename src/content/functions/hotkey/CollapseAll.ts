import { getNestedFrame} from "../utilities.js";

export default function collapseAll(e: KeyboardEvent) {
  if (window.top === null) {
    throw new ReferenceError("top window is null");
  }
  let targetFrame = getNestedFrame(window.top, "listingFrame");
  if (typeof targetFrame != "boolean") {
    let close = targetFrame.contentDocument?.querySelector<HTMLElement>(".f-form-closeall");
    close?.click();
  }
}
