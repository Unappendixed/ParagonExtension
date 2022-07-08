import { getRootWindow} from "../utilities.js";

export default function goToAssumeIdentity() {
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
  if (typeof rootWindow != "boolean" && "document" in rootWindow) {
    rootDocument = rootWindow.document;
  }
  var assumeMenuLink: HTMLElement | null = null;
  if (rootDocument !== null) assumeMenuLink = rootDocument.querySelector("#lnkAssume");
  assumeMenuLink?.click();
  window.setTimeout(() => {
    focusFindField(window);
  }, 1000);
}
