import { State, hook, Hook, useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'haunted';
import { getElement, forceUpdate } from '@stencil/core';
import debugFactory from 'debug';
import { createContext, useDomContext, useHost, useComponent, useDomContextState } from './stencil-context';

const debug = debugFactory('stencil-hook');

// Re-export Haunted hooks classes
export { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, State, hook, Hook };

// Export Dom Context hooks
export { createContext, useDomContext, useHost, useComponent, useDomContextState };

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
  let queued = false;
  let state: State = new State(() => {
    debug('Queue update on element', element);
    if(queued) return;
    queued = true;
    Promise.resolve().then(()=>{
      debug('Forced update on element', element);
      queued = false;
      forceUpdate(element);
    })
  }, element);

  const disconnectedCallback = component['disconnectedCallback'];
  if (!disconnectedCallback) {
    throw new Error("Stencil hooks requires `disconnectedCallback` to be defined (even if it's empty). This is because of how the Stencil compiler works internally");
  }
  component['disconnectedCallback'] = function () {
    state.teardown();
    state = null;
    runIfExists(disconnectedCallback);
  };

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

  let renderFn = component['render'].bind(component);
  const newRenderFn = () => {
    let out = state.run(renderFn);
    state.runEffects();
    return out;
  };
  component['render'] = newRenderFn;
  // state.update();
  return () => {};
}

function runIfExists(fn: unknown) {
  if (typeof fn === 'function') {
    fn();
  }
}
