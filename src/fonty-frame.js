import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';

/**
 * The events our frame produces for outside consumers.
 * @enum {string}
 */
export const FrameEvent = {
  FRAME_ACCESS_ERROR: 'fonty-frame-access-error',
  FRAME_LOAD_START: 'fonty-frame-load-start',
  FRAME_LOAD_COMPLETE: 'fonty-frame-load-complete',
  FRAME_LOAD_ERROR: 'fonty-frame-load-error',
  FRAME_LOAD_TIMEOUT: 'fonty-frame-load-timeout',
  FRAME_LOAD_SCRIPT_ERROR: 'fonty-frame-load-script-error',
  FRAME_LOAD_FONT_ERROR: 'fonty-frame-load-font-error',
  FRAME_LOAD_FONT_COMPLETE: 'fonty-frame-load-font-complete'
};

/**
 * @customElement
 * @polymer
 */
export class FontyFrame extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: flex;
          width: 100%;
          height: 100%;
          background-color: green;
        }
        iframe {
          border: none;
          flex: 1;
        }
      </style>
      <iframe id="fontyframe"
          sandbox="allow-same-origin allow-scripts allow-popups"
          src="intro.html"
          on-load="__handleIframeLoaded"
          on-error="__handleIframeErrored">
      </iframe>
    `;
  }

  static get properties() {
    return {
      /**
       * We will use hidden additional src for the iframe as we want to be
       * able to have observable changes in the correct order, i.e.
       * first cange the `sandbox` attrobute and only then change the src
       * property.
       * @private
       */
      __src: String,
      /**
       * The number of milliseconds to wait for the load event from the iframe
       * before considering the load as unsuccessful/timed out.
       */
      timeout: {
        type: Number,
        value: 30000
      },
      /** The URL to load in the iframe to visualize for the user. */
      src: {
        type: String,
        observer: '__onSrcChanged'
      },
      /**
       * List of URLs to disable the blocking of popups from.
       * This is needed in order to allow the ads (carbon) to work properly.
       * For other websites / url we are protecting the users by dissalowing
       * those.
       */
      allowPopupUrlList: {
        type: Array,
        value: function() {
          return ['introduction.html', 'intro.html']
        }
      }
    };
  }

  constructor() {
    super();
    /**
     * Refenrece to the window object in the iframe.
     * @type {?Window}
     * @private
     */
    this.__win = null;
    /**
     * Reference to the debouncer used to prevent multiple signals / event to be
     * fired when changing the status of the loading of the font in the iframe.
     * @type {?Debouncer}
     * @private
     */
    this.__debouncerFireFontApplicationStatusUpdate = null;
    /**
     * The delay mechinism used to debounce.
     * @type {!AsyncInterface}
     * @private
     */
    this.__debouncerDelay = timeOut.after(100);
    /**
     * The handle resulting in calling a timeout racer.
     * @type {?number}
     * @private
     */
    this.__timeoutHandle = null;
    /**
     * The bound handler for iframe timeing out (i.e. cannot complete loading
     * before the specified time out).
     * @type {function(this: FontyFrame): void}
     */
    this.__boundFontyFrameLoadTimeout = (function() {
      this.fire('fonty-frame-load-timeout')
    }).bind(this);
    this.__boundFontyFrameFontLoadError = (function() {
      this.fire('fonty-frame-font-load-error');
    }).bind(this);
    this.__boundFontyFrameFontLoadSuccess = (function() {
      this.fire('fonty-frame-font-load-success');
    }).bind(this);
    /**
     * The bound message handler. We need this as we are using native
     * listeners.
     * @type {function(e: MessageEvent, this: FontyFrame): void}
     * @private
     */
    this.__boundMessageHandler =  this.__onMessage.bind(this);
  }

  /**
   * Passes the config and the selector to apply it to to the iframe. We expect
   * the iframe to have loaded our injected script in order to be able to
   * handle the message.
   * @param {Object} font The font config to apply on the iframe.
   * @param {string} forElement The element type to apply the font config to.
   */
  postMessage(font, forElement) {
    if (this.__win) {
      this.__win.postMessage({
        applyTo: forElement,
        font
      });
    } else {
      console.warn('Posting font config message, but iframe window is not ready');
    }
  }

  /** @override */
  connectedCallback() {
    super.connectedCallback();
    // TODO: calculate width based on scrolls.
    window.addEventListener('message', this.__boundMessageHandler);
  }

  /** @override */
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('message', this.__boundMessageHandler);
    this.__win = null;
  }

  /**
   * Handle receiving a new src from outside the component. We need to make few
   * things before actually setting the url on the iframe.
   * @param {string=} newv
   * @param {string=} oldv
   */
  __onSrcChanged(newv, oldv) {
    this.__win = null;
    this.__setSandboxAttriute(newv);
    this.fire('fonty-frame-load-start');
    this.__src = newv;
  }

  /**
   * Cancels a previous iframe timeout race and starts a new one.
   * If the timeout is up before the frame could load we will consider
   * loading unsuccessful.
   */
  __startLoadTimeoutRace() {
    if (this.__timeoutHandle !== null) {
      timeOut.cancel(this.__timeoutHandle);
    }
    this.__timeoutHandle = timeOut.run(this.__boundFontyFrameLoadTimeout, this.timeout);
  }

  /**
   * Sets up the iframe sandbox attribute either to be able to open new
   * windows by clicking on a link or not. We would want to enable this
   * only for our internal pages.
   * @param {string} targetUrl
   */
  __setSandboxAttriute(targetUrl) {
    let allowPopups = this.allowPopupUrlList.some(url => targetUrl.includes(url));
    this.$.fontyframe.setAttribute('sandbox',
        `allow-same-origin allow-scripts ${(allowPopups ? ' allow-popups' : '')}`);
  }

  /**
   * Actual handler for messages comming from the iframe. We expect the
   * messages to be produced by our injected script.
   * TODO: enforce reacting only on our messsages by encoding guid.
   * @param {Object} e
   */
  __onMessage(e) {
    const data = e.data;
    if (data.error) {
      this.__debouncerFireFontApplicationStatusUpdate = Debouncer.debounce(
          this.__debouncerFireFontApplicationStatusUpdate,
          this.__debouncerDelay,
          this.__boundFontyFrameFontLoadError);
    } else if (data.complete) {
      this.__debouncerFireFontApplicationStatusUpdate = Debouncer.debounce(
          this.__debouncerFireFontApplicationStatusUpdate,
          this.__debouncerDelay,
          this.__boundFontyFrameFontLoadSuccess);
    } else {
      console.error('Unhandled message from iframe:', e);
    }
  }
}
window.customElements.define('fonty-frame', FontyFrame);