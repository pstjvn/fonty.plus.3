import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { FireMixin } from './fire-mixin.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import * as adaptors from './fonty-adaptors.js';

/**
 * Designed to wrap the `google-fonts-api` and adapt the listing to the
 * needs of the different apps.
 *
 * @polymer
 * @customElement
 */
export class FontyAdaptor extends mixinBehaviors(FireMixin, PolymerElement) {
  static get is() { return 'fonty-adaptor'; }
  static get properties() {
    return {
      /**
       * If Khmer fonts should be removed from the list.
       *
       * This is done because of a bug preventing loading from working
       * correctly.
       */
      stripKhmer: {
        type: Boolean,
        value: false
      },
      /**
       * If the font listing should skip italic fonts.
       *
       * This is useful if the fonts are being spread (see `spread`) and we
       * want to minimize the number of item.
       */
      stripItalic: {
        type: Boolean,
        value: false
      },
      /**
       * If the font list should be spread so one record is made for each
       * font variant.
       */
      spread: {
        type: Boolean,
        value: false
      }
    };
  }

  /**
   * Handles the listing from a child element (assuming compatible with Google
   * fonts list) and adapts it based on the configuration. The resulting list
   * will be emitted with the same event name for compatibility.
   *
   * @param {CustomEvent} e
   *
   * @event 'fonts-loaded'
   * @param {Array<FontRecord>}
   */
  handleFontsLoaded(e) {
    if (e.target !== this && this._shouldModifyListing()) {
      e.stopPropagation();
      let list = e.detail.list;
      if (this.stripKhmer) list = adaptors.removeKhmer(list);
      if (this.spread) {
        list = adaptors.spreadList(list, !this.stripItalic);
      } else {
        list = adaptors.removeItalics(list);
      }
      this.fire('fonts-loaded', { list });
    }
  }

  /**
   * Decides if we should modify the listing in any way or we should just let
   * the event go up the tree.
   * @protected
   * @return {boolean}
   */
  _shouldModifyListing() {
    return this.spread || this.stripKhmer || this.stripItalic || false;
  }

  /** @override */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('fonts-loaded', this.handleFontsLoaded);
  }

  /** @override */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('fonts-loaded', this.handleFontsLoaded);
  }
}
customElements.define(FontyAdaptor.is, FontyAdaptor);
