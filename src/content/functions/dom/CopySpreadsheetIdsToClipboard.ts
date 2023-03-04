export function CopySpreadsheetIdsToClipboard() {


    const menubars: Array<HTMLElement> = new Array(...document.querySelectorAll('.menuBar')).map(e => e as HTMLElement)
    const validMenubars = menubars.filter(e => e.querySelector(".ui-jqgrid"))
    const newButtons = validMenubars.map( e => e.childNodes[0].cloneNode(true));

    function getMLNumbers(element: HTMLElement) {
    const rows: (NodeList | undefined) = document.querySelector(".ui-jqgrid tbody")
        ?.querySelectorAll('tr.ui-widget-content');

    if (rows == undefined) return;
    const mls_ids = new Array(...rows).map(e => (e.childNodes[2] as HTMLElement).innerText);
    
    navigator.clipboard.writeText(JSON.stringify(mls_ids))
    }


}
