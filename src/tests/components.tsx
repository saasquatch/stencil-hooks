import { Component, Prop, h, Host } from '@stencil/core';
import { useEffect, useState } from 'haunted';
import { useDomContext, useDomContextState } from '../stencil-context';
import { withHooks } from '../stencil-hooks';

@Component({
  tag: 'test-component',
})
export class TestComponent {
  @Prop()
  start = 10;

  constructor() {
    withHooks(this);
  }
  render() {
    // const [count, setCount] = [0, (...args:unknown[])=>{}];
    const [count, setCount] = useDomContextState('domcontext:count', this.start);
    useEffect(() => {
      window['running'] = true;

      return () => (window['running'] = false);
    }, [setCount]);

    const incr = () => setCount(count + 2);
    const decr = () => setCount(count - 2);
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
  }

  render() {
    const [status, setStatus] = useState(undefined);
    const count = useDomContext('domcontext:count', { onStatus: setStatus, pollingMs: 100, attempts: 2 });
    return <div>{count || status || 'NONE'}</div>;
  }

  disconnectedCallback() {}
}
