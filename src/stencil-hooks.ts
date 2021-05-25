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
export function withHooks(component: any): void {
  const element = getElement(component);
  const state: State = initializer();

  function initializer() {
    let queued = false;
    return new State(() => {
      debug('Queue update on element', element);
      if (queued) return;
      queued = true;
      // This is important, it makes sure calls to `forceUpdate` are queued
      // Otherwise quick re-renders don't get processed by `forceUpdate`
      Promise.resolve().then(() => {
        debug('Forced update on element', element);
        queued = false;
        forceUpdate(element);
      });
    }, element);
  }

  const disconnectedCallback = component['disconnectedCallback'];
  if (!disconnectedCallback) {
    throw new Error("Stencil hooks requires `disconnectedCallback` to be defined (even if it's empty). This is because of how the Stencil compiler works internally");
  }
  component['disconnectedCallback'] = function wrappedDisconnectedCallback() {
    state.teardown();
    // state = null;
    runIfExists(disconnectedCallback);
  };

  const connectedCallback = component['connectedCallback'];
  component['connectedCallback'] = function wrappedConnectedCallback() {
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
}

function runIfExists(fn: unknown) {
  if (typeof fn === 'function') {
    fn();
  }
}
