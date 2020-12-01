import { State } from 'haunted';
import { getElement, forceUpdate } from '@stencil/core';
import debugFactory from 'debug';

const debug = debugFactory('stencil-context');

/**
 * Set up a Stencil component's internal state so that it can use hooks.
 * 
 * This will re-render the component when hook state changes.
 * 
 * This is still compatible with external state.
 * 
 * @param component 
 */
export function withHooks(component: any) {
  const element = getElement(component);
  let state: State = new State(() => {
    debug('Forced update on element', element);
    forceUpdate(element);
  }, element);
  const disconnectedCallback = component['disconnectedCallback'];
  if (!disconnectedCallback) {
    throw new Error("Stencil hooks requires `disconnectedCallback` to be defined (even if it's empty). This is because of how the Stencil compiler works internally");
  }
  const connectedCallback = component['connectedCallback'];
  component['connectedCallback'] = function () {
    if (!state) {
      state = new State(() => {
        debug('Forced update on element', element);
        forceUpdate(component);
      }, element);
    }
    state.update();
    runIfExists(connectedCallback);
  };
  component['disconnectedCallback'] = function () {
    state.teardown();
    state = null;
    runIfExists(disconnectedCallback);
  };

  let renderFn = component['render'].bind(component);
  const newRenderFn = () => {
    let out = state.run(renderFn);
    state.runEffects();
    return out;
  };
  component['render'] = newRenderFn;
  return () => {};
}

function runIfExists(fn: unknown) {
  if (typeof fn === 'function') {
    fn();
  }
}
