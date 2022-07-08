export default function focusPowerSearch(e: KeyboardEvent) {
  e.preventDefault();
  if (window.top === null) {
    throw new ReferenceError("top window element could not be found");
  }
  let field = window.top.document.querySelector<HTMLElement>(".select2-search__field");
  field?.click();
  field?.focus();
}
