import createRemoveBreakButtons from "./functions/dom/CreateRemoveBreakButtons.js";
import findAndDisplayBrokerage from "./functions/dom/DisplayBrokerage.js";
import removeDatePickersFromTabIndex from "./functions/dom/RemoveDatePickersFromTabIndex.js";
import showExpiryNextToCancellation from "./functions/dom/ShowExpiryNextToCancellation.js";
import warnRegion from "./functions/dom/WarnRegion.js";
import calculateCancellation from "./functions/hotkey/CalculateCancellation.js";
import closeTab from "./functions/hotkey/CloseTab.js";
import collapseAll from "./functions/hotkey/CollapseAll.js";
import expandAll from "./functions/hotkey/ExpandAll.js";
import focusPowerSearch from "./functions/hotkey/FocusPowerSearch.js";
import goToAssumeIdentity from "./functions/hotkey/GoToAssumeIdentity.js";
import goToListingMaintenance from "./functions/hotkey/GoToListingMaintenance.js";
import printListing from "./functions/hotkey/PrintListing.js";
import saveListing from "./functions/hotkey/SaveListing.js";
import togglePrivacy from "./functions/hotkey/TogglePrivacy.js";
import listingMoreActionsContext from "./functions/mouse/ListingMoreActionsContext.js";

import { SettingsObj } from "./types";

export default <SettingsObj> {
  toggle: {
    type: "meta",
    config: { enabled: true },
  },
  tabindex: {
    type: "dom",
    config: { enabled: false },
    function: removeDatePickersFromTabIndex,
  },
  addbuttons: {
    type: "dom",
    config: { enabled: false },
    function: createRemoveBreakButtons,
  },
  maintainContext: {
    type: "mouse",
    config: { enabled: false },
    function: listingMoreActionsContext,
  },
  cancellationShortcut: {
    type: "dom",
    config: { enabled: false },
    function: showExpiryNextToCancellation,
  },
  brokerageHeader: {
    type: "dom",
    config: { enabled: false },
    function: findAndDisplayBrokerage,
  },
  regionWarning: {
    type: "dom",
    config: { enabled: true },
    function: warnRegion,
  },
  save: {
    type: "key",
    config: { ctrl: true, alt: false, shift: false, key: "s", code: "KeyS", enabled: true },
    function: saveListing,
  },
  print: {
    type: "key",
    config: { ctrl: true, alt: false, shift: false, key: "q", code: "KeyQ", enabled: true },
    function: printListing,
  },
  search: {
    type: "key",
    config: { ctrl: true, alt: false, shift: true, key: "F", code: "KeyF", enabled: true },
    function: focusPowerSearch,
  },
  expand: {
    type: "key",
    config: { ctrl: true, alt: false, shift: false, key: "]", code: "BracketRight", enabled: true },
    function: expandAll,
  },
  collapse: {
    type: "key",
    config: { ctrl: true, alt: false, shift: false, key: "[", code: "BracketLeft", enabled: true },
    function: collapseAll,
  },
  gotoListings: {
    type: "key",
    config: { ctrl: false, alt: false, shift: false, key: "F1", code: "F1", enabled: true },
    function: goToListingMaintenance,
  },
  togglePrivacy: {
    type: "key",
    config: { ctrl: false, alt: false, shift: false, key: "F2", code: "F2", enabled: true },
    function: togglePrivacy,
  },
  closeTab: {
    type: "key",
    config: { ctrl: false, alt: true, shift: false, key: "`", code: "Backquote", enabled: true },
    function: closeTab,
  },
  expCalc: {
    type: "key",
    config: { ctrl: false, alt: false, shift: false, key: "F3", code: "F3", enabled: true },
    function: calculateCancellation,
  },
  gotoAssume: {
    type: "key",
    config: { ctrl: false, alt: false, shift: false, key: "F4", code: "F4", enabled: true },
    function: goToAssumeIdentity,
  },
};
