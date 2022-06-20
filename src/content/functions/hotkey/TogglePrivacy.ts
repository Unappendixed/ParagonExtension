function togglePrivacy(e: KeyboardEvent) {
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
