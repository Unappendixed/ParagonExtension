// convert current input box to uppercase

export default function uppercaseField (e: KeyboardEvent) {
  let target = e.target as HTMLElement;
  if (target.tagName === "input") {
    let targetInput = target as HTMLInputElement;
    let currentValue = targetInput.value;
    targetInput.value = currentValue.toUpperCase();
  } else if (target.tagName === "textarea") {
    let targetInput = target as HTMLTextAreaElement;
    let currentValue = targetInput.value;
    targetInput.value = currentValue.toUpperCase();
  }
}