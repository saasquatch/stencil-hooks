/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface TestChild {
    }
    interface TestComponent {
        "start": number;
    }
}
declare global {
    interface HTMLTestChildElement extends Components.TestChild, HTMLStencilElement {
    }
    var HTMLTestChildElement: {
        prototype: HTMLTestChildElement;
        new (): HTMLTestChildElement;
    };
    interface HTMLTestComponentElement extends Components.TestComponent, HTMLStencilElement {
    }
    var HTMLTestComponentElement: {
        prototype: HTMLTestComponentElement;
        new (): HTMLTestComponentElement;
    };
    interface HTMLElementTagNameMap {
        "test-child": HTMLTestChildElement;
        "test-component": HTMLTestComponentElement;
    }
}
declare namespace LocalJSX {
    interface TestChild {
    }
    interface TestComponent {
        "start"?: number;
    }
    interface IntrinsicElements {
        "test-child": TestChild;
        "test-component": TestComponent;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "test-child": LocalJSX.TestChild & JSXBase.HTMLAttributes<HTMLTestChildElement>;
            "test-component": LocalJSX.TestComponent & JSXBase.HTMLAttributes<HTMLTestComponentElement>;
        }
    }
}
