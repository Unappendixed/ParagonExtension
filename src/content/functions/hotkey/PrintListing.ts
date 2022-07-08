import { getNestedFrame, printReport} from "../utilities.js";

export default function printListing(e: KeyboardEvent) {
  e.preventDefault();
  if (window.top === null) {
    throw new ReferenceError("top window element could not be found");
  }
  if (getNestedFrame(window.top, "listingFrame")) {
    e.preventDefault();
    printReport();
  }
}
