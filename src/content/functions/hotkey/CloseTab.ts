export default function closeTab(e: KeyboardEvent) {
  e.preventDefault();
  if (window.top === null) {
    throw new ReferenceError("top window not found i guess");
  }
  let lst: NodeListOf<HTMLElement> = window.top.document.querySelectorAll<HTMLElement>('em[title="Close Tab"]');
  let arr: HTMLElement[] = [];
  lst.forEach((e) => (e.getAttribute("display") !== "none" ? arr.push(e) : null));
  arr[arr.length - 1].click();
}
