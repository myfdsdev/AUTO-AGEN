// What every settings section provides, and the controls they share (Components board).
import { esc } from "../../../lib/dom";
import { ui } from "../../state";

export type Section = {
  label: string;
  lede: string;
  body: () => string;
  /** Return true when the section needs to be drawn again. */
  click?: (el: HTMLElement) => boolean | void;
  change?: (el: HTMLElement) => boolean | void;
};

/** A switch bound to ui.toggles[key]; the shell flips it on click. */
export const sw = (key: string, label: string) =>
  `<button type="button" class="switch" role="switch" aria-checked="${!!ui.toggles[key]}" aria-label="${esc(label)}" data-toggle="${esc(key)}"></button>`;

/** A settings row: title and description on the left, a control on the right. */
export const row = (title: string, sub: string, control: string) =>
  `<div class="row"><div class="row-text"><span class="row-title">${esc(title)}</span>${sub ? `<span class="row-sub">${esc(sub)}</span>` : ""}</div>${control}</div>`;
