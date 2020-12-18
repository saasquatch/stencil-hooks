import { Component, Prop, h, Host } from '@stencil/core';
import { ContextProvider } from 'dom-context';
import { withHooks, useEffect, useState, useDomContext, useDomContextState, useReducer } from '../stencil-hooks';

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
    const decr = () => setCount(count - 1);
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

const CountReducer = (state:number, action:"plus"|"minus")=>{
  if(action === "plus"){
    return state+1;
  }else if (action === "minus"){
    return state-1;
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
    const [count, dispatch] = useReducer(CountReducer,3)

    // Logs every render
    window['renderValue'](count);

    return (
      <Host>
        <div>{count || 'NONE'}</div>
        <button onClick={() => dispatch("plus")}>+1</button>
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
    const [count, setCount] = useDomContextState("example-context", 3);

    // Logs every render
    window['renderValue'](count);

    return (
      <Host>
        <div>{count || 'NONE'}</div>
        <button onClick={() => setCount(count+1)}>+1</button>
      </Host>
    );
  }

  disconnectedCallback() {}
}

function mockFunction(impl = (...args: unknown[]) => {}) {
  const calls = [];
  const mock = (...args: unknown[]) => {
    calls.push(args);
    return impl(...args);
  };
  mock.calls = calls;
  return mock;
}
