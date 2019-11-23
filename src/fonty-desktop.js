import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import './google-fonts-api.js';
import './fonty-adaptor.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import './fonty-frame.js';
import './nav-list.js';

/**
 * @customElement
 * @polymer
 */
class FontyDesktop extends PolymerElement {
  static get properties() {
    return {
      apiKey: String,
      sortOptions: Array
    };
  }
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
          grid-column-gap: 3px;
          grid-row-gap: 3px;
          /* background: green; */
        }
        .back {
          grid-area: back;
          background-color: beige;
        }
        .fonts {
          grid-area: fonts;
          background-color: beige;
        }
        .plus {
          grid-area: plus;
          background-color: beige;
        }
        header {
          grid-area: url;
          background-color: yellow;
        }
        nav {
          grid-area: nav;
          background-color: blue;
        }
        main {
          grid-area: main;
          background-color: red;
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
        .download {
          grid-area: download;
          background-color: beige;
        }
        .share {
          grid-area: share;
          background-color: beige;
        }
      </style>
      <div class="back"></div>
      <div class="fonts"></div>
      <div class="plus"></div>
      <header>
      </header>
      <nav>
        <nav-list></nav-list>
        <select>
          <template is="dom-repeat" items="[[sortOptions]]">
            <option value="[[item]]">[[item]]</option>
          </template>
        </select>
        <fonty-adaptor strip-khmer spread strip-italic>
          <google-fonts-api sort-by="trending" sort-options="{{sortOptions}}"></google-fonts-api>
        </fonty-adaptor>
      </nav>
      <main>
        <fonty-frame></fonty-frame>
      </main>
      <custom-kik>
        <div class="download"></div>
        <div class="share"></div>
      </custom-kik>
    `;
  }

  constructor() {
    super();
    this.addEventListener('fonts-loaded', this.test);
  }
  test(e) {
    console.log(e.detail);
  }

}

window.customElements.define('fonty-desktop', FontyDesktop);
