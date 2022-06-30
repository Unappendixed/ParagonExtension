import { getNestedFrame } from "../utilities.js";

export default function togglePrivacy(e: KeyboardEvent) {
  e.preventDefault();
  if (window.top === null) {
    throw new ReferenceError("window.top is null");
  }
  let frame = getNestedFrame(window.top, "listingFrame");
  if (typeof frame === "boolean") {
    throw new ReferenceError("Failed to find nested listing frame element.");
  }
  let doc = frame.contentDocument;
  if (typeof doc === "boolean" || doc === null) {
    throw new ReferenceError("Frame's content document not found");
  }
  let select: HTMLInputElement | null = null;
  let name: HTMLInputElement | null = null;
  switch (document.location.hostname.split(".")[0]) {
    case "bcres":
      select = doc.querySelector<HTMLInputElement>("#f_214");
      name = doc.querySelector('label[for="f_423"');
      break;
    case "bccls":
      select = doc.querySelector<HTMLInputElement>("#f_217");
      name = doc.querySelector('label[for="f_429"');
      break;
  }

  if (select === null || select === undefined) {
    throw new ReferenceError("privacy toggle element could not be found");
  }
  if (name === null) {
    throw new ReferenceError("owner name field element could not be found");
  }

  if (["N", ""].includes(select.value)) {
    select.value = "Y";
    name.classList.add("privacy");
    doc.querySelector(".f-pcnm-legend")?.classList.add("privacy-color");
  } else if (select.value === "Y") {
    select.value = "";
    name.classList.remove("privacy");
  }
}
