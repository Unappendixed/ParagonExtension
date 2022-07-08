import { getNestedFrame, isCommercial, numberPad } from "../utilities.js";
export default function calculateCancellation(e: Event) {
  e.preventDefault();
  if (window.top === null) {
    throw new ReferenceError("The top window is null... somehow");
  }
  let frame = getNestedFrame(window.top, "listingFrame");
  if (typeof frame === "boolean") {
    throw new ReferenceError("Listing maintenance frame cannot be null");
  }
  let doc = frame.contentDocument;
  if (typeof doc === "boolean" || doc === null) {
    throw new ReferenceError("Iframe content document cannot be found");
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
    let new_date_string = numberPad(new_date);
    canc.value = new_date_string;
  }
}
