# Stencil Hooks

Let's you use React-style hooks in your [Stencil](https://stenciljs.com/) components. Based on [haunted](https://github.com/matthewp/haunted/).


### Getting Started

Prefered distribution is via NPM, 

```
npm i @saasquatch/stencil-hooks
```

To use the library you need to call `withHooks` in the constructor of your component, and then you can use hooks inside of your `render` function.

```js
import { withHooks, useState } from '@saasquatch/stencil-hooks';

@Component({
  tag: 'my-counter',
})
export class Counter {
  constructor() {
    withHooks(this);
  }

  render() {
    const [count, setCount] = useState(0);
    return (
      <div>
        {count} <button onClick={() => setCount(count + 1)}>+1</button>
      </div>
    );
  }

  disconnectedCallback() {
    // required for `useEffect` cleanups to run
  }
}
```

See it in action on the [live demo](https://webcomponents.dev/edit/gqVMwvd4PFqN3isJPt2h).


### FAQ

 - **Shouldn't I just use Stencil state?** Yes, for simple cases you should. But for more complex state use cases hooks help make your state logic more modular, testable and shareable. The core stencil team has acknowledged that internal component state is not enough, and added libraries such as `stencil-store` and `stencil-redux` and `stencil-state-tunnel`. `stencil-hooks` uses the same `forceUpdate` from `@stencil/core` that is used by [stencil-store](https://github.com/ionic-team/stencil-store/blob/master/src/subscriptions/stencil.ts#L44).
 - **Why not X state library?** The SaaSquatch team is used to thinking about state problems in hooks, so it's good for us. In some cases Redux or MobX or even Backbone might be a better solution.
 - **Does this library actually work?** This library has a large set of tests across most of the hooks in haunted and is used in production at SaaSquatch.

### Differences from Haunted

This library re-exports most of haunted, but swaps out the `Context` implementation with [dom-context](https://github.com/saasquatch/dom-context).