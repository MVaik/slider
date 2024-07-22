import { Component, Element, h, Prop, State, Watch } from '@stencil/core/internal';
import { debounce } from '../../utils/debounce';
import { convertRange } from '../../utils/convertRange';

@Component({
  tag: 'dojo-slider',
  styleUrl: 'slider.css',
  shadow: true,
})
export class SliderComponent {
  @Prop() type: 'default' | 'range' = 'default';
  @Prop() boundaries: { min: number; max: number } = { min: 0, max: 100 };
  @Prop() defaultValues: [number, number];
  @Prop() thumbSize: number = 24;
  @Prop() valueSuffix: string = '';
  @Prop() includeSteps: boolean = false;
  @Prop() isVertical: boolean = false;
  @State() value = [];
  @Element() el: HTMLElement;
  sliderRef!: HTMLElement;
  thumbRefs: HTMLElement[] = [];

  componentWillLoad() {
    // Init slider
    this.value = [
      Math.max(
        this.defaultValues?.[0] ?? this.boundaries.min ?? 0,
        this.boundaries.min ?? 0,
      ),
      Math.min(this.defaultValues?.[1] ?? this.boundaries.max, this.boundaries.max),
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
  }

  setElementProperty(element: HTMLElement | Element, key: string, value: string) {
    (element as HTMLElement).style.setProperty(key, value);
  }

  getBoundedValueInPercentage(value: number) {
    return convertRange(
      value,
      [this.boundaries.min ?? 0, this.boundaries.max ?? 100],
      [0, 100],
    );
  }

  getValueInBoundedRangeFromPercentage(value: number) {
    return convertRange(
      value,
      [0, 100],
      [this.boundaries.min ?? 0, this.boundaries.max ?? 100],
    );
  }

  setThumbPositions(values: number[]) {
    if (!this.thumbRefs.length) return;
    // Update thumb location whenever values change
    values.forEach((value, index) => {
      if (!this.thumbRefs[index]) return;
      this.setElementProperty(
        this.thumbRefs[index],
        '--slider-thumb-position',
        this.getBoundedValueInPercentage(value) + '%',
      );
    });
  }

  setProgress(values: number[]) {
    if (!this.sliderRef) return;
    this.setElementProperty(
      this.sliderRef,
      '--slider-progress-start',
      this.getBoundedValueInPercentage(values[0]) + '%',
    );
    this.setElementProperty(
      this.sliderRef,
      '--slider-progress-end',
      this.getBoundedValueInPercentage(values[1]) + '%',
    );
  }

  getMinThumbValue(index: number) {
    if (index === 1 && this.type === 'range') {
      return this.value[0] + 1;
    }
    return this.boundaries.min ?? 0;
  }

  getMaxThumbValue(index: number) {
    if (index === 0 && this.type === 'range') {
      return this.value[1] - 1;
    }
    return this.boundaries.max ?? 100;
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
    if (newValue > this.boundaries.max) {
      return this.boundaries.max;
    }
    if (newValue < this.boundaries.min) {
      return this.boundaries.min;
    }
    return newValue;
  }

  setNewValueWithinBounds(value: number, index: number) {
    // Extra overflow / overlap checks
    const newValue = this.getBoundedThumbValue(value, index);
    // Map the value to trigger re-render
    this.value = this.value.map((val, locationIndex) => {
      if (index === locationIndex) {
        return newValue;
      }
      return val;
    });
  }

  handleThumbDrag = debounce((_, index: number) => {
    const sliderRight = this.sliderRef.offsetLeft + this.sliderRef.offsetWidth;
    const onPointerMove = (e: MouseEvent) => {
      // Get pointer position inside slider
      const thumbRelativePosition =
        1 - (sliderRight - e.pageX) / this.sliderRef.offsetWidth;
      // Convert position from 0-100 range to our arbitrarily bounded range
      const valueInBoundedRange = this.getValueInBoundedRangeFromPercentage(
        100 * thumbRelativePosition,
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
        newValue += 1;
        break;
      case 'ArrowUp':
        newValue += this.isVertical ? -1 : 1;
        break;
      case 'ArrowLeft':
        newValue -= 1;
        break;
      case 'ArrowDown':
        newValue += this.isVertical ? 1 : -1;
        break;
      case 'PageUp':
        newValue += this.isVertical ? -5 : 5;
        break;
      case 'PageDown':
        newValue += this.isVertical ? 5 : -5;
        break;
      case 'Home':
        newValue = this.getMinThumbValue(index);
        break;
      case 'End':
        newValue = this.getMaxThumbValue(index);
        break;
    }
    this.setNewValueWithinBounds(newValue, index);
  }

  render() {
    return (
      <div class="wrapper" role="group">
        <div class="inputs">
          {this.value.map((_, inputIndex) => {
            if (this.type !== 'range' && inputIndex === 0) return null;

            return (
              <input
                class="input"
                type="text"
                onChange={e => this.handleInputChange(e, inputIndex)}
                value={`${this.value[inputIndex]}${
                  this.valueSuffix ? ' ' + this.valueSuffix : ''
                }`}
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
                data-slider-thumb-index={thumbIndex}
                aria-valuenow={this.value[thumbIndex]}
                aria-valuemin={this.getMinThumbValue(thumbIndex)}
                aria-valuemax={this.getMaxThumbValue(thumbIndex)}
              ></button>
            );
          })}
        </div>
        <div class="steps">
          {this.includeSteps &&
            Array.from(Array(11).keys()).map(step => (
              <button class="step" onClick={() => this.handleStep(step)}></button>
            ))}
        </div>
      </div>
    );
  }
}
