export default function warnRegion(doc: Document) {
  const boardAlias = { F: "FVREB", H: "CADREB", N: "BCNREB" };
  let region = doc.querySelector<HTMLElement>("#f_4")?.parentElement?.parentElement?.firstElementChild
    ?.firstElementChild?.firstElementChild as HTMLElement;
  if (region) {
    if (boardAlias[region.innerHTML[0] as keyof Object] && !region.dataset.hasWarned) {
      alert(
        `Warning! This listing belongs to ${
          boardAlias[region.innerHTML[0] as keyof Object]
        }.\nYou can disable this warning in the extension settings.`
      );
      region.dataset.hasWarned = "true";
    }
  }
}
