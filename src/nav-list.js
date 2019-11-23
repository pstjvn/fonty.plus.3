import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {IronMenuBehavior} from '@polymer/iron-menu-behavior/iron-menu-behavior.js';

export class NavList extends mixinBehaviors(IronMenuBehavior, PolymerElement) {
  static get is() { return 'nav-list'; }
  static get template() {
    return html`<slot></slot>`;
  }
  static get properties() {
    return {
      role: {
        value: 'tablist',
        type: String,
        reflectToAttribute: true
      }
    }
  }
}
customElements.define(NavList.is, NavList);

