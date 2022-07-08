import { getNestedFrame } from "../utilities.js";

export default function expandAll() {
  if (window.top === null) {
    throw new ReferenceError("top window element is null");
  }
  let targetFrame = getNestedFrame(window.top, "listingFrame");
  if (typeof targetFrame !== "boolean") {
    //console.log(target_frame)
    let open = targetFrame.contentDocument?.querySelector<HTMLElement>(".f-form-openall");
    // FIXME this generates an browser error at the moment because the button has an empty inline javascript expression
    // which violates content security policies when called from another JS file
    // low severity
    open?.click();
  }
}
