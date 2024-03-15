import { useRef } from "react";

export class WebComponent extends HTMLElement {

  connectedCallback() {
    const type = this.getAttribute('type')!;
    const value = this.getAttribute('value')!;
    this.style.display = 'inline-flex';
    this.style.marginRight = type === 'text' ? '-5px' : '-25px';
    this.innerHTML = /*html*/`
      <input type=${type} value="${value}" />
    `;
    const inputElement = this.querySelector('input') as HTMLInputElement;
    inputElement.style.padding = '0 2px';

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    let textBefore = inputElement.value;
    inputElement.addEventListener('focus', () => {
      // inputElement.style.backgroundColor = 'rgba(255,255,255,0.1)';
      inputElement.style.outline = '1px solid #add8e6';
      textBefore = inputElement.value;
    });
    inputElement.addEventListener('blur', () => {
      // inputElement.style.backgroundColor = '';
      inputElement.style.outline = '';
      inputElement.value = textBefore;
    });
    // listen to enter press on input element
    inputElement.addEventListener('keyup', function onInputKeyUp(e) {
      if (e.key === 'Enter') {
        if (textBefore === inputElement.value) { return; }
        textBefore = inputElement.value;
        self.dispatchEvent(new CustomEvent('onChange', {
          bubbles: true, // Allows the event to bubble up the DOM tree
          composed: true, // Allows the event to pass through Shadow DOM boundaries
          detail: inputElement.value
        }));
        inputElement.blur();
      }
    });
    const updateInputLength = () => {
      if (type === 'text') {
        inputElement.size = Math.max(1, inputElement.value.length);
      } else {
        const length = Math.pow(10, inputElement.value.length).toString();
        inputElement.max = length;
        inputElement.min = '1';
      }
    }
    updateInputLength();
    inputElement.addEventListener('input', () => {
      updateInputLength();
    });
  }

}

// Define the custom element
customElements.get('app-compact-input') || customElements.define('app-compact-input', WebComponent);

export const CompactInput = <V extends number | string>(props: { value: V, onChange: (arg: V) => void, type: 'number' | 'text' }) => {
  const ref = useRef<HTMLElement>(null);
  const eventListenerAdded = useRef(false);
  if (!eventListenerAdded.current && ref.current) {
    ref.current.addEventListener('onChange', function onChangeCompactInput(e) {
      const customEvent = e as Event & { detail: string };
      props.onChange(customEvent.detail as V);
    });
    eventListenerAdded.current = true;
  }
  return (
    <app-compact-input
      ref={ref}
      value={props.value}
      type={props.type}
    />
  )
}