import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Prop,
  State,
  Watch,
} from '@stencil/core/internal';
import { debounce } from '../../utils/debounce';
import { convertRange } from '../../utils/convertRange';

const DEFAULT_INCREMENT_VALUE = 1;
const DEFAULT_FAST_INCREMENT_VALUE = 5;
const SLIDER_CSS_VARIABLES = {
  THUMB_POSITION: '--slider-thumb-position',
  PROGRESS_START: '--slider-progress-start',
  PROGRESS_END: '--slider-progress-end',
};

@Component({
  tag: 'dojo-slider',
  styleUrl: 'slider.css',
  shadow: true,
})
export class SliderComponent {
  @Prop() type: 'default' | 'range' = 'default';
  @Prop() boundaries?: { min: number; max: number };
  @Prop() defaultValues: [number, number];
  @Prop() thumbSize: number = 24;
  @Prop() valueSuffix: string = '';
  @Prop() includeSteps: boolean = false;
  @Prop() isVertical: boolean = false;
  @Prop() incrementValue = DEFAULT_INCREMENT_VALUE;
  @Prop() fastIncrementValue = DEFAULT_FAST_INCREMENT_VALUE;
  @Prop() labels: { min: string; max: string; step?: string };

  @State() value: number[] = [];

  @Event() valueChange: EventEmitter<number[]>;

  @Element() el: HTMLElement;
  sliderRef!: HTMLElement;
  thumbRefs: HTMLElement[] = [];
  innerBoundaries = { min: 0, max: 100 };

  componentWillLoad() {
    this.innerBoundaries = { ...this.innerBoundaries, ...(this.boundaries ?? {}) };
    // Init slider
    this.value = [
      Math.max(
        this.defaultValues?.[0] ?? this.innerBoundaries.min ?? 0,
        this.innerBoundaries.min ?? 0,
      ),
      Math.min(
        this.defaultValues?.[1] ?? this.innerBoundaries.max,
        this.innerBoundaries.max,
      ),
    ];
  }

  componentDidLoad() {
    // Set css variables
    this.setThumbPositions(this.value);
    this.setProgress(this.value);
  }

  @Watch('value')
  watchvalue(newValues: number[]) {
    // Re-set css variables on change
    this.setThumbPositions(newValues);
    this.setProgress(newValues);
    this.valueChange.emit(newValues);
  }

  setElementProperty(element: HTMLElement | Element, key: string, value: string) {
    (element as HTMLElement).style.setProperty(key, value);
  }

  getBoundedValueInPercentage(value: number) {
    return convertRange(
      value,
      [this.innerBoundaries.min ?? 0, this.innerBoundaries.max ?? 100],
      [0, 100],
    );
  }

  getValueInBoundedRangeFromPercentage(value: number) {
    return convertRange(
      value,
      [0, 100],
      [this.innerBoundaries.min ?? 0, this.innerBoundaries.max ?? 100],
    );
  }

  setThumbPositions(values: number[]) {
    if (!this.thumbRefs.length) return;
    // Update thumb location whenever values change
    values.forEach((value, index) => {
      if (!this.thumbRefs[index]) return;
      this.setElementProperty(
        this.thumbRefs[index],
        SLIDER_CSS_VARIABLES.THUMB_POSITION,
        `${this.getBoundedValueInPercentage(value)}%`,
      );
    });
  }

  setProgress(values: number[]) {
    if (!this.sliderRef) return;
    this.setElementProperty(
      this.sliderRef,
      SLIDER_CSS_VARIABLES.PROGRESS_START,
      `${this.getBoundedValueInPercentage(values[0])}%`,
    );
    this.setElementProperty(
      this.sliderRef,
      SLIDER_CSS_VARIABLES.PROGRESS_END,
      `${this.getBoundedValueInPercentage(values[1])}%`,
    );
  }

  getMinThumbValue(index: number) {
    if (index === 1 && this.type === 'range') {
      return this.value[0] + 1;
    }
    return this.innerBoundaries.min ?? 0;
  }

  getMaxThumbValue(index: number) {
    if (index === 0 && this.type === 'range') {
      return this.value[1] - 1;
    }
    return this.innerBoundaries.max ?? 100;
  }

  getBoundedThumbValue(value: number, index: number) {
    let newValue = Math.round(value);
    const otherThumbValue = index === 0 ? this.value[1] : this.value[0];

    if (index === 0 && newValue >= otherThumbValue) {
      newValue = otherThumbValue - 1;
    }
    if (index === 1 && newValue <= otherThumbValue && this.type === 'range') {
      newValue = otherThumbValue + 1;
    }
    if (newValue > this.innerBoundaries.max) {
      return this.innerBoundaries.max;
    }
    if (newValue < this.innerBoundaries.min) {
      return this.innerBoundaries.min;
    }
    return newValue;
  }

  setNewValueWithinBounds(value: number, index: number) {
    // Extra overflow / overlap checks
    const newValue = this.getBoundedThumbValue(value, index);
    if (this.value[index] === newValue) {
      return;
    }
    // Map the value to trigger re-render
    this.value = this.value.map((val, locationIndex) => {
      if (index === locationIndex) {
        return newValue;
      }
      return val;
    });
  }

  handleThumbDrag = debounce((_, index: number) => {
    // Handle y axis instead on vertical sliders
    const sliderStart = this.isVertical
      ? this.sliderRef.offsetTop
      : this.sliderRef.offsetLeft;
    const sliderSize = this.isVertical
      ? this.sliderRef.offsetHeight
      : this.sliderRef.offsetWidth;
    const sliderFarEdge = sliderStart + sliderSize;

    const onPointerMove = (e: MouseEvent) => {
      const pointerPosition = this.isVertical ? e.pageY : e.pageX;
      // Get pointer position inside slider
      const thumbRelativePosition = (sliderFarEdge - pointerPosition) / sliderSize;
      const orderedThumbRelativePosition = this.isVertical
        ? thumbRelativePosition
        : 1 - thumbRelativePosition;
      // Convert position from 0-100 range to our arbitrarily bounded range
      const valueInBoundedRange = this.getValueInBoundedRangeFromPercentage(
        100 * orderedThumbRelativePosition,
      );
      this.setNewValueWithinBounds(valueInBoundedRange, index);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener(
      'pointerup',
      () => {
        document.removeEventListener('pointermove', onPointerMove);
      },
      { once: true },
    );
  }, 50);

  handleInputChange(e: Event, index: number) {
    const target = e.target as HTMLInputElement;
    const parsedValue = Number.parseInt(target.value);
    // Empty field if number is not valid
    if (Number.isNaN(parsedValue)) {
      target.value = '';
      return;
    }
    this.setNewValueWithinBounds(parsedValue, index);
  }

  handleStep(step: number) {
    this.setNewValueWithinBounds(step * 10, 1);
  }

  handleKeyDown(e: KeyboardEvent, index: number) {
    let newValue = this.value[index];
    switch (e.key) {
      case 'ArrowRight':
        newValue += this.incrementValue;
        break;
      case 'ArrowUp':
        newValue += this.incrementValue;
        break;
      case 'ArrowLeft':
        newValue -= this.incrementValue;
        break;
      case 'ArrowDown':
        newValue -= this.incrementValue;
        break;
      case 'PageUp':
        newValue += this.fastIncrementValue;
        break;
      case 'PageDown':
        newValue -= this.fastIncrementValue;
        break;
      case 'Home':
        newValue = this.getMinThumbValue(index);
        break;
      case 'End':
        newValue = this.getMaxThumbValue(index);
        break;
      default:
        return;
    }
    this.setNewValueWithinBounds(newValue, index);
  }

  render() {
    return (
      <div class={{ 'wrapper': true, 'wrapper--vertical': this.isVertical }} role="group">
        <div class="inputs">
          {this.value.map((_, inputIndex) => {
            // Reverse inputs on vertical slider, can't reverse via styling as that would cause confusion in screen readers
            let index = inputIndex;
            if (this.isVertical) {
              index = inputIndex === 0 ? 1 : 0;
            }
            if (this.type !== 'range' && index === 0) return null;

            return (
              <input
                class="input"
                type="text"
                onChange={e => this.handleInputChange(e, index)}
                value={`${this.value[index]}${
                  this.valueSuffix ? ' ' + this.valueSuffix : ''
                }`}
                aria-label={index === 0 ? this.labels?.min : this.labels?.max}
              />
            );
          })}
        </div>
        <div class="slider" ref={el => (this.sliderRef = el)}>
          <div class="line"></div>
          <span class="progress"></span>
          {this.value.map((_, thumbIndex) => {
            // First thumb is only rendered for ranges
            if (this.type !== 'range' && thumbIndex === 0) return null;

            return (
              <button
                key={thumbIndex}
                class="thumb"
                role="slider"
                onPointerDown={e => this.handleThumbDrag(e, thumbIndex)}
                onKeyDown={e => this.handleKeyDown(e, thumbIndex)}
                ref={ref => (this.thumbRefs[thumbIndex] = ref)}
                aria-valuenow={this.value[thumbIndex]}
                aria-valuemin={this.getMinThumbValue(thumbIndex)}
                aria-valuemax={this.getMaxThumbValue(thumbIndex)}
                aria-label={thumbIndex === 0 ? this.labels?.min : this.labels?.max}
                aria-orientation={this.isVertical ? 'vertical' : undefined}
              ></button>
            );
          })}
        </div>
        <div class="steps">
          {this.includeSteps &&
            Array.from(Array(11).keys()).map((_, index, arr) => {
              const step = this.isVertical ? arr.at(-1 - index) : arr.at(index);
              return (
                <button
                  class="step"
                  onClick={() => this.handleStep(step)}
                  aria-label={`Set ${
                    this.labels?.step
                  } to ${this.getValueInBoundedRangeFromPercentage(step * 10)}`}
                ></button>
              );
            })}
        </div>
      </div>
    );
  }
}
