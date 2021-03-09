import { getElement, getRenderingRef } from '@stencil/core';
import { HTMLStencilElement } from '@stencil/core/internal';
import * as DOMHook from '@saasquatch/dom-context-hooks';
import { ContextProvider, ListenerOptions } from 'dom-context';

export function createContext<T>(name: string, initial?: T) {
  const raw = DOMHook.createContext(name, initial);

  const useContext = (options?: PollingOpts) => useDomContext<T>(name, options);
  const useContextState = (initialState?: T) => useDomContextState<T>(name, initialState || initial);

  const stencil = {
    ...raw,
    useContext,
    useContextState,
  };
  return stencil;
}

export function useComponent<T = unknown>(): T {
  return getRenderingRef();
}

export function useHost(): HTMLStencilElement {
  const component = useComponent();
  return getElement(component);
}

type PollingOpts<T = unknown> = Omit<ListenerOptions<T>, 'contextName' | 'element' | 'onChange'>;

/**
 * Uses the parent context, if it exists. Similar to React's `useContext`
 *
 * Since this uses `dom-context` as the library, functional components can't provide context
 *
 * @param contextName
 */
export function useDomContext<T = unknown>(contextName: string, options: PollingOpts = {}): T | undefined {
  const host = useHost();
  return DOMHook.useDomContext(host, contextName, options);
}

type NewState<T> = T | ((previousState?: T) => T);
type StateUpdater<T> = (value: NewState<T>) => void;

/**
 * Similar to `useState` except the state is shared with children
 */
export function useDomContextState<T>(contextName: string, initialState?: T): readonly [T, StateUpdater<T>, ContextProvider<T>] {
  const host = useHost();
  return DOMHook.useDomContextState(host, contextName, initialState);
}
