import { getElement, getRenderingRef } from '@stencil/core';
import { HTMLStencilElement } from '@stencil/core/internal';
import { createContext as rawCreate, ContextProvider, ContextListener, ListenerOptions } from 'dom-context';
import { useEffect, useMemo, useReducer, useRef, useState } from 'haunted';
import debugFactory from 'debug';
const debug = debugFactory('stencil-hook');

export function createContext<T>(name: string, initial?: T) {
  const raw = rawCreate(name, initial);

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
  const initialContextValue = useRef(undefined);
  const [state, setState] = useState(undefined);

  const { listener } = useMemo(() => {
    const onChange = (next: T) => {
      initialContextValue.current = next;
      setState(next);
    };
    const l = new ContextListener({
      contextName,
      element: host,
      onChange,
      ...options,
    });
    l.start();
    debug("Listener initialized", l);
    return {
      listener:l,
    };
  }, [contextName, initialContextValue]);

  useEffect(() => {

    debug("Listener starting (or restarting)", listener);
    listener.start();
    return () => {
      debug("Listener stopping (or restopping)", listener);
      listener.stop();
    };
  }, [listener, host.isConnected]);

  return state || initialContextValue.current;
}

type NewState<T> = T | ((previousState?: T) => T);
type StateUpdater<T> = (value: NewState<T>) => void;

/**
 * Similar to `useState` except the state is shared with children
 */
export function useDomContextState<T>(contextName: string, initialState?: T): readonly [T, StateUpdater<T>, ContextProvider<T>] {
  const host = useHost();

  const provider = useMemo(() => {
    const p = new ContextProvider({
      contextName: contextName,
      element: host,
      initialState: initialState,
    });
    p.start();
    debug("Provider initialized", p);
    return p;
  }, [contextName, host]);

  useEffect(() => {
    debug("Provider starting (or restarting)", provider);
    provider.start();
    return () => {
      debug("Provider stopping (or re-stopping)", provider);
      provider.stop()
    }
  }, [provider, host.isConnected]);

  const [value, dispatch] = useReducer<T, T, NewState<T>>((_, next: NewState<T>) => {
    let newValue: T;
    debug("New context value", next)
    if (typeof next === 'function') {
      newValue = (next as (n: T) => T)(provider.context);
    } else {
      newValue = next;
    }
    provider.context = newValue;
    return provider.context;
  }, provider.context);

  return [value, dispatch, provider];
}
