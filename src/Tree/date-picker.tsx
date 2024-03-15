import flatpickr from "flatpickr";
import 'flatpickr/dist/flatpickr.css';
import { useRef } from "react";
import { dateToISOLikeButLocal } from "../shared/functions";

export class WebComponent extends HTMLElement {

  connectedCallback() {
    this.innerHTML = /*html*/`
      <span>${this.getAttribute('value')!}</span>
    `;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    flatpickr(this.querySelector('span')!, {
      enableTime: true,
      defaultDate: this.getAttribute('value')!,
      onChange: function onChangeFlatpickr(s) {
        self.dispatchEvent(new CustomEvent('onChange', {
          bubbles: true, // Allows the event to bubble up the DOM tree
          composed: true, // Allows the event to pass through Shadow DOM boundaries
          detail: s[0] // Optional data to pass with the event
        }))
      },
    });
  }
}

// Define the custom element
customElements.get('app-date-picker') || customElements.define('app-date-picker', WebComponent);

export const DatePicker = (props: { value: Date, onChange: (date: Date) => void }) => {
  const ref = useRef<HTMLElement>(null);
  const eventListenerAdded = useRef(false);
  if (!eventListenerAdded.current && ref.current) {
    ref.current.addEventListener('onChange', function onChangeDatePicker(e) {
      const customEvent = e as Event & { detail: Date };
      props.onChange(customEvent.detail);
    });
    eventListenerAdded.current = true;
  }
  return (
    <app-date-picker
      ref={ref}
      value={dateToISOLikeButLocal(props.value)}
    />
  )
}