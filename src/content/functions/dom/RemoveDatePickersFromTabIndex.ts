export default function removeDatePickersFromTabIndex(doc: Document) {
  let pickers = doc.querySelectorAll('.datepick-trigger:not([tabindex="-1"])');
  pickers.forEach(function (e) {
    e.setAttribute("tabindex", "-1");
  });
}
