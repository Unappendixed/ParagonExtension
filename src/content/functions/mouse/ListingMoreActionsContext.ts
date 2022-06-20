export default function listingMoreActionsContext(e: MouseEvent) {
  const source = e.target as HTMLElement;
  const isListingMaintContextEnabled = hotkey_dict["maintain_context"];
  if (isListingMaintContextEnabled) {
    const isSelectedElementTableData = source.tagName === "TD";
    const canFindListingGrid = document.querySelectorAll("#gbox_grid").length > 0;
    if (isSelectedElementTableData && canFindListingGrid) {
      e.preventDefault();
      const parent = source.parentElement as HTMLElement;
      const target = parent.querySelector<HTMLElement>('[aria-describedby="grid_Action"] > a');
      if (target) {
        target.click();
      }
    }
  }
}
