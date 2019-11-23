import '@polymer/iron-ajax';
import { SortOptions, getUrl } from './google-fonts-consts.js';
import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { FireMixin } from './fire-mixin.js';

const cache = {};

/**
 * Element wrapper around the Google fonts API.
 *
 * @polymer
 * @customElement
 *
 */
export class GoogleFontsApi extends FireMixin(PolymerElement) {
  static get is() { return 'google-fonts-api'; }
  static get properties() {
    return {
      /** The key to use when communicating with Google API */
      key: String, 
      /** The sorting to use for the listing */
      sortBy: String,
      /** If the result should be cached. Cache is based on sort option. */
      cache: {
        type: Boolean,
        value: false
      },
      /** 
       * Exposes the sort options supported by Google API.
       * @type {Array<string>}
       */
      sortOptions: {
        type: Array,
        readonly: true,
        notify: true,
        value: SortOptions
      }
    };
  }
  static get template() {
    return html`
      <style>
        :host {
          display: none;
        }
      </style>
      <iron-ajax id="ajax" auto handle-as="json" on-response="__handleAjaxResponse"></iron-ajax> 
    `;
  }
  static get observers() {
    return [
      '__handleUrlAttributes(key, sortBy)'
    ];
  }
  __handleUrlAttributes(key, sortBy) {
    if (key && sortBy) {
      if (this.cache) {
        if (cache[sortBy]) {
          // Fire the event with delay as we want to have the same (testable)
          // behavior even if the cache is present.
          setTimeout(function() {
            this.__handleFontList(cache[sortBy]);
          }, 1, this);
          return;
        }
      }
      this.$.ajax.url = getUrl(key, sortBy);
    }
  }
  /**
   * Fired when a result was loaded from the remote server.
   * @event fonts-loaded
   * @param {Array<Object>} list The fonts as loaded from Google.
   */
  __handleAjaxResponse(e) {
    const items = e.detail.response.items;
    if (this.cache) {
      cache[this.sortBy] = items;
    }
    this.__handleFontList(items);
  }

  __handleFontList(list) {
    this.fire('fonts-loaded', { list });
  }
}
customElements.define(GoogleFontsApi.is, GoogleFontsApi);


