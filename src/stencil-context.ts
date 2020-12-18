import { getElement, getRenderingRef } from '@stencil/core';
import { HTMLStencilElement } from '@stencil/core/internal';
import { createContext as rawCreate, ContextProvider, ContextListener, ListenerOptions } from 'dom-context';
import { useEffect, useMemo, useReducer, useRef, useState } from 'haunted';

const LISTENER = Symbol('listener');

interface Constructor<T> {
  new (...args: any[]): T;
}

type ContextHandler<T, C> = (component: C, context: T) => unknown;

export function createContext<T>(name: string, initial?: T) {
  const raw = rawCreate(name, initial);

  function connectToProps<C>(component: Constructor<C>, handler: ContextHandler<T, C>) {
    const ComponentPrototype = component.prototype;
    const { componentWillLoad, disconnectedCallback } = ComponentPrototype;

    ComponentPrototype.componentWillLoad = function () {
      console.log('Consumer load');
      const element = getElement(this);
      const onChange = (val: T) => handler(this, val);

      const listener = new raw.Listener({
        element,
        onChange,
        onStatus: st => console.log('Status', st),
      });
      this[LISTENER] = listener;
      listener.start();

      componentWillLoad && componentWillLoad.call(this);
    };
    ComponentPrototype.disconnectedCallback = function () {
      console.log('Disconnected Consumer');
      this[LISTENER] && this[LISTENER].stop();
      disconnectedCallback && disconnectedCallback.call(this);
    };
  }

  function provide<C>(component: C, initialState?: T): ContextProvider<T> {
    const element = getElement(component);
    const provider = new raw.Provider({
      element,
      initialState: initialState,
    });
    provider.start();
    const connectedCallback = component['connectedCallback'];
    component['connectedCallback'] = function () {
      provider.start();
      if (connectedCallback) {
        connectedCallback.call(component);
      }
    };

    const disconnectedCallback = component['disconnectedCallback'];
    component['disconnectedCallback'] = function () {
      console.log('Provider stop');
      provider.stop();
      if (disconnectedCallback) {
        disconnectedCallback.call(component);
      }
    };
    return provider;
  }

  const useContext = (options?: PollingOpts) => useDomContext<T>(name, options);
  const useContextState = () => useDomContextState<T>(name, initial);

  const stencil = {
    ...raw,
    connectToProps,
    provide,
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
  const contextValue = useRef(undefined);
  const [state, setState] = useState(undefined);

  const { listener } = useMemo(() => {
    const onChange = (next: T) => {
      contextValue.current = next;
      setState(next);
    };
    const listener = new ContextListener({
      contextName,
      element: host,
      onChange,
      ...options,
    });
    listener.start();
    return {
      listener,
    };
  }, [contextName, contextValue]);

  useEffect(() => {
    return () => {
      listener.stop();
    };
  }, [listener]);

  useEffect(() => {}, [contextValue.current]);

  return state || contextValue.current;
}

type NewState<T> = T | ((previousState?: T) => T);
type StateUpdater<T> = (value: NewState<T>) => void;

/**
 * Similar to `useState` except the state is shared with children
 */
export function useDomContextState<T>(contextName: string, initialState?: T): readonly [T, StateUpdater<T>, ContextProvider<T>] {
  const host = useHost();

  const provider = useMemo(() => {
    return new ContextProvider({
      contextName: contextName,
      element: host,
      initialState: initialState,
    });
  }, [contextName, host]);

  useEffect(() => {
    provider.start();
    return () => provider.stop();
  }, [provider]);

  const [value, dispatch] = useReducer<T, T, NewState<T>>((_, next: NewState<T>) => {
    let newValue: T;
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
