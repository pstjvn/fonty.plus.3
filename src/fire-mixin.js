import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';

/**
 * Provides the utility method `fire` which returns the proper event behavior
 * from Polymer 1/2.
 *
 * @polymer
 * @mixinFunction
 */
export const FireMixin = dedupingMixin(function(superClass) {
  class FireMixinImpl extends superClass {
    fire(eventName, detail) {
      const e = new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        detail: detail
      });
      this.dispatchEvent(e);
    }
  };
  return FireMixinImpl;
});
