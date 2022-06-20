export default function showExpiryNextToCancellation(doc: Document) {
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
