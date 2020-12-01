# Stencil Hooks

This is library that makes it easier to write Stencil components. It relies on the excellent [Haunted](https://github.com/matthewp/haunted/) library and also connects [https://github.com/saasquatch/dom-context](DOM Context) for passing context down through slots in the dom.

## Usage


```js
import { Component, h, Host } from '@stencil/core';

import { useState } from 'haunted';
import { withHooks } from '@saasquatch/stencil-hooks';

@Component({
  tag: 'test-component',
})
export class TestComponent {

  constructor() {
    withHooks(this);
  }

  render() {
    const [count, setCount] = useState(10);

    const incr = () => setCount(count + 1);
    return (
      <Host>
        <div>{count}</div>
        <button onClick={incr}>Plus</button>
        <slot />
      </Host>
    );
  }

  // An empty `disconnectedCallback` is required for `useEffect` cleanups hooks to run
  disconnectedCallback() {}
}
```
