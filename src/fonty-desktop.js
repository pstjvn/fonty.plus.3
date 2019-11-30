import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
// import '@polymer/iron-iconset-svg/iron-iconset-svg.js';
import '@polymer/iron-icon/iron-icon.js';
import './google-fonts-api.js';
import './fonty-adaptor.js';
import './fonty-frame.js';
import './nav-list.js';
import './desktop-icons.js';

/**
 * @customElement
 * @polymer
 */
class FontyDesktop extends PolymerElement {
  static get properties() { return {apiKey: String, sortOptions: Array}; }
  static get template() {
    return html`
      <style>
        :host {
          display: grid;
          width: 100vw;
          height: 100vh;
          grid-template-areas: "back nav url kik"
                               ". nav main kik"
                               ". nav main kik"
                               "fonts nav main kik"
                               "plus nav main kik"
                               ". nav main kik";
          grid-template-columns: 60px 350px 1fr 60px;
          grid-template-rows: 60px 40px 40px 60px 60px 1fr;
        }
        header, nav, .fonts, .plus, .download, .share, custom-kik {
          background-color: var(--secondary-bg);
        }
        .back, .fonts, .plus, .download, .share {
          display: flex;
          justify-content: center;
          align-items: center;
          --iron-icon-height: 20px;
          --iron-icon-width: 20px;
        }
        iron-icon {
          fill: var(--secondary-fg);
        }
        .back {
          grid-area: back;
        }
        .fonts {
          grid-area: fonts;
        }
        .plus {
          grid-area: plus;
        }
        .download {
          grid-area: download;
        }
        .share {
          grid-area: share;
        }
        header {
          grid-area: url;
        }
        nav {
          grid-area: nav;
        }
        main {
          grid-area: main;
          box-shadow: 0 3px 8px 1px rgba(0,0,0,0.1);
        }
        custom-kik {
          grid-area: kik;
          display: grid;
          width: 100%;
          height: 100%;
          grid-template-areas: "." "download" "share" ".";
          grid-template-rows: 1fr 60px 60px 1fr;
          grid-template-columns: 1fr;
        }
      </style>
      <div class="back">
        <iron-icon icon="desktop-icons:arrow-back"></iron-icon>
      </div>
      <div class="fonts">
        <iron-icon icon="desktop-icons:format-size"></iron-icon>
      </div>
      <div class="plus">
        <iron-icon icon="desktop-icons:add"></iron-icon>
      </div>
      <header>
      </header>
      <nav>
        <nav-list></nav-list>
        <!--<select>
          <template is="dom-repeat" items="[[sortOptions]]">
            <option value="[[item]]">[[item]]</option>
          </template>
        </select>-->
        <fonty-adaptor strip-khmer spread strip-italic>
          <google-fonts-api sort-by="trending" sort-options="{{sortOptions}}"></google-fonts-api>
        </fonty-adaptor>
      </nav>
      <main>
        <fonty-frame></fonty-frame>
      </main>
      <custom-kik>
        <div class="download">
          <iron-icon icon="desktop-icons:backup"></iron-icon>
        </div>
        <div class="share">
          <iron-icon icon="desktop-icons:screen-share"></iron-icon>
        </div>
      </custom-kik>
      <desktop-icons></desktop-icons>
    `;
  }

  constructor() {
    super();
    this.addEventListener('fonts-loaded', this.test);
  }
  test(e) { console.log(e.detail); }
}

window.customElements.define('fonty-desktop', FontyDesktop);
