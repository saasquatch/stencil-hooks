import { Component, Prop, h, Host } from '@stencil/core';
import { ContextProvider } from 'dom-context';
import { createContext } from '../stencil-context';
import { withHooks, useEffect, useState, useDomContext, useDomContextState, useReducer, useMemo, useRef, useCallback } from '../stencil-hooks';
import * as HooksAPI from '../stencil-hooks';
import { mockFunction } from './mockFunction';
import { setImplementation } from '@saasquatch/universal-hooks';
setImplementation(HooksAPI);

@Component({
  tag: 'test-component',
})
export class TestComponent {
  @Prop()
  start = 10;
  provider: ContextProvider<any>;

  @Prop({ reflect: true, mutable: true })
  provided: number;

  constructor() {
    withHooks(this);
  }
  render() {
    // const [count, setCount] = [0, (...args:unknown[])=>{}];
    const [count, setCount, provider] = useDomContextState('domcontext:count', this.start);
    window['provider'] = provider;
    this.provider = provider;
    useEffect(() => {
      window['running'] = true;

      return () => (window['running'] = false);
    }, [setCount]);

    const incr = () => {
      const next = count + 1;
      setCount(next);
      window['provided'] = next;
      this.provided = next;
    };
    return (
      <Host>
        <div>{count}</div>
        <button onClick={incr}>Plus</button>
        <slot />
      </Host>
    );
  }

  disconnectedCallback() {}
}

@Component({
  tag: 'test-child',
})
export class ChildComponent {
  constructor() {
    withHooks(this);
    // window['onStatus'] = jest.fn();
    window['renderValue'] = window['renderValue'] || mockFunction();
  }

  render() {
    const count = useDomContext('domcontext:count', { pollingMs: 100, attempts: 2 });

    // Logs every render
    window['renderValue'](count);

    return <div>{count || 'NONE'}</div>;
  }

  disconnectedCallback() {}
}

@Component({
  tag: 'state-child',
})
export class StateChild {
  constructor() {
    window['renderValue'] = window['renderValue'] || mockFunction();
    withHooks(this);
  }

  render() {
    const [count, setCount] = useState(3);

    // Logs every render
    window['renderValue'](count);

    return (
      <Host>
        <div>{count || 'NONE'}</div>
        <button onClick={() => setCount(count + 1)}>+1</button>
      </Host>
    );
  }

  disconnectedCallback() {}
}

@Component({
  tag: 'state-effect-child',
})
export class StateEffectChild {
  constructor() {
    window['renderValue'] = window['renderValue'] || mockFunction();
    withHooks(this);
  }

  render() {
    const [trigger, setTrigger] = useState(false);
    const [count, setCount] = useState(3);

    // Logs every render
    window['renderValue'](count);

    useEffect(() => {
      if (trigger) {
        setCount(4);
      }
    }, [trigger]);

    return (
      <Host>
        <div>{count || 'NONE'}</div>
        <button onClick={() => setTrigger(true)}>+1</button>
      </Host>
    );
  }

  disconnectedCallback() {}
}

const CountReducer = (state: number, action: 'plus' | 'minus') => {
  if (action === 'plus') {
    return state + 1;
  } else if (action === 'minus') {
    return state - 1;
  }
};

@Component({
  tag: 'reducer-child',
})
export class ReducerChild {
  constructor() {
    window['renderValue'] = window['renderValue'] || mockFunction();
    withHooks(this);
  }

  render() {
    const [count, dispatch] = useReducer(CountReducer, 3);

    // Logs every render
    window['renderValue'](count);

    return (
      <Host>
        <div>{count || 'NONE'}</div>
        <button onClick={() => dispatch('plus')}>+1</button>
      </Host>
    );
  }

  disconnectedCallback() {}
}

@Component({
  tag: 'domstate-child',
})
export class DomStateChild {
  constructor() {
    window['renderValue'] = window['renderValue'] || mockFunction();
    withHooks(this);
  }

  render() {
    const [count, setCount] = useDomContextState('example-context', 3);

    // Logs every render
    window['renderValue'](count);

    return (
      <Host>
        <div>{count || 'NONE'}</div>
        <button onClick={() => setCount(count + 1)}>+1</button>
      </Host>
    );
  }

  disconnectedCallback() {}
}

function fibonacci(num) {
  if (num <= 1) return 1;
  return fibonacci(num - 1) + fibonacci(num - 2);
}

@Component({
  tag: 'memo-child',
})
export class MemoChild {
  constructor() {
    window['renderValue'] = window['renderValue'] || mockFunction();
    withHooks(this);
  }

  render() {
    const [value, setVal] = useState(12);
    const fib = useMemo(() => fibonacci(value), [value]);

    // Logs every render
    window['renderValue'](fib);

    return (
      <Host>
        <div>{fib || 'NONE'}</div>
        <button onClick={() => setVal(value + 1)}>+1</button>
      </Host>
    );
  }

  disconnectedCallback() {}
}

@Component({
  tag: 'ref-child',
})
export class RefChild {
  constructor() {
    window['renderValue'] = window['renderValue'] || mockFunction();
    withHooks(this);
  }

  render() {
    const [value, setValue] = useState('NONE');
    const myRef = useRef<HTMLSpanElement>(undefined);
    // Logs every render
    window['renderValue'](value);

    return (
      <Host>
        <span ref={el => (myRef.current = el)}>Span1</span>
        <div>{value}</div>
        <button onClick={() => setValue(myRef.current.innerText)}></button>
      </Host>
    );
  }

  disconnectedCallback() {}
}

@Component({
  tag: 'effect-test',
})
export class EffectTest {
  constructor() {
    window['lifecycleCalls'] = window['lifecycleCalls'] || mockFunction();
    withHooks(this);
  }
  render() {
    useEffect(() => {
      window['lifecycleCalls']('useEffect');
      return () => {
        window['lifecycleCalls']('useEffectCleanup');
      };
    }, []);

    window['lifecycleCalls']('render');

    return (
      <Host>
        <div>true</div>
      </Host>
    );
  }
  connectedCallback() {
    window['lifecycleCalls']('connectedCallback');
  }

  disconnectedCallback() {
    window['lifecycleCalls']('disconnectedCallback');
  }
}

@Component({
  tag: 'null-lifecycle-test',
})
export class NullLifecycleTest {
  constructor() {
    window['lifecycleCalls'] = window['lifecycleCalls'] || mockFunction();
    withHooks(this);
  }
  render() {
    window['lifecycleCalls']('render');

    return (
      <Host>
        <div>true</div>
      </Host>
    );
  }
  connectedCallback() {
    window['lifecycleCalls']('connectedCallback');
  }

  disconnectedCallback() {
    window['lifecycleCalls']('disconnectedCallback');
  }
}

@Component({
  tag: 'callbacks-test',
})
export class CallbacksTest {
  constructor() {
    window['mockCallback'] = window['mockCallback'] || mockFunction();
    withHooks(this);
  }
  render() {
    const [count, setCount] = useState(0);
    const triggerOn = count >= 2;

    const callback = useCallback(() => count, [triggerOn]);
    // @ts-ignore
    window['mockCallback'](callback);

    return (
      <Host>
        <div>{count}</div>
        <button onClick={() => setCount(count + 1)}></button>
      </Host>
    );
  }

  disconnectedCallback() {}
}

const KillSwitch = createContext<{ kill: () => void }>('parent-child-loop');
@Component({
  tag: 'killer-parent',
})
export class KillerParent {
  constructor() {
    window['lifecycleCalls'] = window['lifecycleCalls'] || mockFunction();
    withHooks(this);
  }
  render() {
    window['lifecycleCalls']('parent.render.start');
    const ref = useRef(undefined);
    const killFn = useCallback(() => {
      window['lifecycleCalls']('parent.kill');
      const el = ref.current;
      el.innerHTML = '';
    }, []);

    KillSwitch.useContextState({ kill: killFn });

    window['lifecycleCalls']('parent.render.end');
    return (
      <Host>
        <div ref={el => (ref.current = el)}>
          <innocent-child></innocent-child>
        </div>
      </Host>
    );
  }

  disconnectedCallback() {
    window['lifecycleCalls']('parent.disconnectedCallback');
  }
}

@Component({
  tag: 'innocent-child',
})
export class InnocentChild {
  constructor() {
    window['lifecycleCalls'] = window['lifecycleCalls'] || mockFunction();
    withHooks(this);
  }
  render() {
    window['lifecycleCalls']('child.render.start');
    const doKill = KillSwitch.useContext();
    const ref = useRef('child');
    const [state, setState] = useState(0);
    useEffect(() => {
      return () => {
        window['lifecycleCalls'](ref.current + '.useEffect.cleanup');
        setTimeout(() => {
          window['lifecycleCalls'](ref.current + '.useEffect.timeout');
        }, 0);
      };
    }, []);

    useEffect(() => {
      window['lifecycleCalls'](ref.current + '.useEffect.start');
      window['lifecycleCalls'](ref.current + '.useEffect.setState.1');
      setState(1);
      doKill && doKill.kill();
      window['lifecycleCalls'](ref.current + '.useEffect.setState.2');
      setState(2);
      window['lifecycleCalls'](ref.current + '.useEffect.end');
    }, []);

    window['lifecycleCalls'](ref.current + '.render.end');
    return (
      <Host>
        <div>
          {ref.current} and {state}
        </div>
      </Host>
    );
  }

  disconnectedCallback() {
    window['lifecycleCalls']('child.disconnectedCallback');
  }
}
