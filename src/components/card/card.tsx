import { Component, h } from '@stencil/core/internal';

@Component({
  tag: 'dojo-card',
  styleUrl: 'card.css',
  shadow: true,
})
export class CardComponent {
  render() {
    return (
      <div class="card">
        <slot />
      </div>
    );
  }
}
