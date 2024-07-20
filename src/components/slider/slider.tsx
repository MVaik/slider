import { Component, Element, h, Prop, State, Watch } from '@stencil/core/internal';
import { debounce } from '../../utils/debounce';

@Component({
  tag: 'dojo-slider',
  styleUrl: 'slider.css',
  shadow: true,
})
export class SliderComponent {
  @State() thumbLocations = [[15]];
  @Element() el: HTMLElement;
  slider!: HTMLElement;

  @Prop() thumbSize: number = 24;

  @Watch('thumbLocations')
  watchThumbLocations(newValues: number[]) {
    // Update thumb location whenever values change
    this.setElementProperty(this.slider, '--slider-thumb-left', newValues[0][0] + 'px');
  }

  componentDidLoad() {
    // Init slider
    this.setElementProperty(this.slider, '--slider-thumb-left', this.thumbLocations[0][0] + 'px');
    this.setElementProperty(this.slider, '--slider-thumb-size', this.thumbSize + 'px');
  }

  setElementProperty(element: HTMLElement | Element, key: string, value: string) {
    (element as HTMLElement).style.setProperty(key, value);
  }

  getBoundedThumbValue(value: number | string) {
    let newValue = Math.round(Number(value));
    if (newValue > this.slider.offsetWidth - this.thumbSize / 2) {
      newValue = this.slider.offsetWidth - this.thumbSize / 2;
    }
    if (newValue < 0) {
      newValue = 0;
    }
    return newValue;
  }

  handleThumbDrag = debounce((e: MouseEvent, index: number) => {
    const initialMouseX = e.pageX;
    const initialValue = this.thumbLocations[index][0];
    const onMouseMove = (e: MouseEvent) => {
      const newMouseX = e.pageX;
      const newValue = this.getBoundedThumbValue(initialValue + newMouseX - initialMouseX);
      this.thumbLocations = this.thumbLocations.map((val, locationIndex) => {
        if (index === locationIndex) {
          return [newValue];
        }
        return val;
      });
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener(
      'mouseup',
      () => {
        document.removeEventListener('mousemove', onMouseMove);
      },
      { once: true },
    );
  }, 50);

  handleInputChange(e: Event, index: number) {
    const newValue = this.getBoundedThumbValue((e.target as HTMLInputElement).value);
    this.thumbLocations = this.thumbLocations.map((val, locationIndex) => {
      if (index === locationIndex) {
        return [newValue];
      }
      return val;
    });
  }

  render() {
    return (
      <div class="wrapper" role="group">
        <div class="inputs">
          <input class="input" type="text" onChange={e => this.handleInputChange(e, 0)} size={1} value={this.thumbLocations[0][0]} />
          <input class="input" type="text" size={1} />
        </div>
        <div class="slider" ref={el => (this.slider = el)}>
          <div class="line"></div>
          <span class="progress"></span>
          <button class="thumb" role="slider" onMouseDown={e => this.handleThumbDrag(e, 0)}></button>
        </div>
      </div>
    );
  }
}
