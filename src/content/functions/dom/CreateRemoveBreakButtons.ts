export default function createRemoveBreakButtons(doc: Document) {
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  button.setAttribute("class", "whitespace-button");
  button.setAttribute("tabindex", "-1");
  button.textContent = "Remove Breaks";

  const existingWhitespaceButton = doc.querySelectorAll<HTMLElement>(".whitespace-button").length == 0;
  if (existingWhitespaceButton) {
    var texts: NodeListOf<HTMLElement>;
    switch (document.location.hostname.split(".")[0]) {
      case "bcres":
        texts = doc.querySelectorAll<HTMLElement>("#f_550, #f_551, #f_552");
        break;
      case "bccls":
        texts = doc.querySelectorAll<HTMLElement>("#f_554, #f_555");
        break;
      default:
        return;
    }
    for (let elem of texts) {
      let iter_button: HTMLElement = button.cloneNode() as HTMLElement;
      iter_button.setAttribute("for", elem.id);
      iter_button.className = "whitespace-button";
      iter_button.innerText = "Remove Breaks";
      elem.before(iter_button);
      iter_button.addEventListener("click", function (args: MouseEvent) {
        if (doc === null) {
          throw new ReferenceError("Listing maintenance iframe is null");
        }
        let text_elem = doc.querySelector<HTMLTextAreaElement>(`#${(args.target as HTMLElement).getAttribute("for")}`);
        if (text_elem === null) {
          throw new ReferenceError("Can't find text box connected to clicked button.");
        }
        let text = text_elem.value;
        if (text) {
          text = text.replace(/\n+/g, " ");
          text = text.replace(/ {2,}/g, " ");
          text_elem.value =  text;
        }
      });
    }
  }
}
