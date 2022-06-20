function goToListingMaintenance(e: KeyboardEvent) {
  e.preventDefault();
  if (window.top === null) {
    throw new ReferenceError("Top window is null");
  }
  const targetDocument = window.top.document;
  targetDocument.querySelector<HTMLElement>("#listings-nav")?.click();
  const navElement = targetDocument.querySelector<HTMLElement>("#listings-nav + div");
  if (navElement === null) {
    throw new ReferenceError("Navigation element could not be found");
  }
  navElement.style.display = "none";
  targetDocument.querySelector<HTMLElement>('#listings-nav + div a[fullWindow="False"]')?.click();
  navElement.style.display = "block";
  try {
    const growlElement = targetDocument.querySelector<HTMLElement>("div#jGrowl");
    if (growlElement === null) {
      return;
    }
    growlElement.style.display = "none";
  } catch {}
}
