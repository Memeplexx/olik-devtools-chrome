import flatpickr from "flatpickr";
import 'flatpickr/dist/flatpickr.css';
import { useRef } from "react";

export class WebComponent extends HTMLElement {

  setAttribute(qualifiedName: string, value: string): void {
    super.setAttribute(qualifiedName, value);
    switch (qualifiedName) {
      case 'value':
        this.innerHTML = value;
        break;
    }
  }

  connectedCallback() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    flatpickr(this, {
      enableTime: true,
      defaultDate: this.getAttribute('value')!,
      formatDate: d => d.toISOString(),
      onClose: function onChangeFlatpickr(s) {
        self.dispatchEvent(new CustomEvent('onChange', {
          bubbles: true, // Allows the event to bubble up the DOM tree
          composed: true, // Allows the event to pass through Shadow DOM boundaries
          detail: s[0] // Optional data to pass with the event
        }))
      },
    })
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
      value={props.value.toISOString()}
    />
  )
}
