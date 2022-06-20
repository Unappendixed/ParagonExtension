export default function findAndDisplayBrokerage(doc: Document) {
  let title = doc.querySelector<HTMLElement>(".f-pcnm-legend");
  if (title === null) {
    throw new ReferenceError("Frame header not found.");
  }
  if (!title.dataset.brokerage) {
    let json_string = doc.querySelector<HTMLInputElement>("#hdnf_28")?.value;
    if (json_string === undefined) {
      throw new ReferenceError("Unable to get brokerage name.");
    }
    title.dataset.brokerage = "true";
    title.innerHTML += " | " + JSON.parse(json_string)[0].Name;
  }
}
