export default function calculateCancellation(e: Event) {
  e.preventDefault();
  if (window.top === null) {
    throw new ReferenceError("The top window is null... somehow");
  }
  let doc = getNestedFrame(window.top, "listingFrame");
  if (typeof doc === "boolean") {
    throw new ReferenceError("Listing maintenance frame cannot be null");
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
    //let new_date_string = `${new_date.getMonth() + 1}/${new_date.getDate()}/${new_date.getFullYear()}`
    let new_date_string = numberPad(new_date);
    // eff.innerHTML += `<span><i>+60 days: (${new_date_string})</i></span>`
    canc.value = new_date_string;
  }
}
