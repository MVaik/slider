/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface DojoCard {
    }
    interface DojoSlider {
        "boundaries"?: { min: number; max: number };
        "defaultValues": [number, number];
        "fastIncrementValue": number;
        "includeSteps": boolean;
        "incrementValue": number;
        "isVertical": boolean;
        "labels": { min: string; max: string; step?: string };
        "thumbSize": number;
        "type": 'default' | 'range';
        "valueSuffix": string;
    }
}
export interface DojoSliderCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLDojoSliderElement;
}
declare global {
    interface HTMLDojoCardElement extends Components.DojoCard, HTMLStencilElement {
    }
    var HTMLDojoCardElement: {
        prototype: HTMLDojoCardElement;
        new (): HTMLDojoCardElement;
    };
    interface HTMLDojoSliderElementEventMap {
        "valueChange": number[];
    }
    interface HTMLDojoSliderElement extends Components.DojoSlider, HTMLStencilElement {
        addEventListener<K extends keyof HTMLDojoSliderElementEventMap>(type: K, listener: (this: HTMLDojoSliderElement, ev: DojoSliderCustomEvent<HTMLDojoSliderElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLDojoSliderElementEventMap>(type: K, listener: (this: HTMLDojoSliderElement, ev: DojoSliderCustomEvent<HTMLDojoSliderElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLDojoSliderElement: {
        prototype: HTMLDojoSliderElement;
        new (): HTMLDojoSliderElement;
    };
    interface HTMLElementTagNameMap {
        "dojo-card": HTMLDojoCardElement;
        "dojo-slider": HTMLDojoSliderElement;
    }
}
declare namespace LocalJSX {
    interface DojoCard {
    }
    interface DojoSlider {
        "boundaries"?: { min: number; max: number };
        "defaultValues"?: [number, number];
        "fastIncrementValue"?: number;
        "includeSteps"?: boolean;
        "incrementValue"?: number;
        "isVertical"?: boolean;
        "labels"?: { min: string; max: string; step?: string };
        "onValueChange"?: (event: DojoSliderCustomEvent<number[]>) => void;
        "thumbSize"?: number;
        "type"?: 'default' | 'range';
        "valueSuffix"?: string;
    }
    interface IntrinsicElements {
        "dojo-card": DojoCard;
        "dojo-slider": DojoSlider;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "dojo-card": LocalJSX.DojoCard & JSXBase.HTMLAttributes<HTMLDojoCardElement>;
            "dojo-slider": LocalJSX.DojoSlider & JSXBase.HTMLAttributes<HTMLDojoSliderElement>;
        }
    }
}
