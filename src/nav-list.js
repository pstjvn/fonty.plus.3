import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import {
  IronMenuBehavior
} from '@polymer/iron-menu-behavior/iron-menu-behavior.js';

Polymer({
  is: 'nav-list',
  _template: html `<slot></slot>`,
  hostAttributes: {role: 'tablist'},
  behaviors: [IronMenuBehavior]
});