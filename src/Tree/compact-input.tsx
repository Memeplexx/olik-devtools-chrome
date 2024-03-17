import { useRef } from "react";

export class WebComponent extends HTMLElement {

  textBefore!: string;

  get input() { return this.querySelector('input') as HTMLInputElement; }
  get span() { return this.querySelector('span') as HTMLSpanElement; }
  get type(){ return this.getAttribute('type')! as 'text' | 'number'; }
  get value(){ return this.getAttribute('value')!; }

  setAttribute(qualifiedName: string, value: string): void {
    super.setAttribute(qualifiedName, value);
    if (qualifiedName === 'value') {
      if (this.children.length === 0) { return; }
      this.resetState(value);
    }
  }

  connectedCallback() {
    this.style.display = 'inline-flex';
    this.innerHTML = /*html*/`
      <span></span>
      <input />
    `;
    this.input.type = this.type;
    this.input.style.marginRight = this.type === 'text' ? '0' : '-28px';
    this.input.style.padding = this.type === 'text' ? '0 2px 0 4px' : '0 0 0 4px';
    this.input.style.marginLeft = this.type === 'text' ? '3px' : '-3px';
    this.resetState(this.value);

    this.span.addEventListener('click', () => {
      this.span.style.display = 'none';
      this.input.style.display = '';
      this.input.focus();
    });

    this.input.addEventListener('focus', () => {
      this.input.style.outline = '1px solid #add8e6';
      this.textBefore = this.input.value;
    });

    this.input.addEventListener('blur', () => {
      this.input.style.outline = '';
      this.input.value = this.textBefore;
      this.input.style.display = 'none';
      this.span.style.display = '';
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    // listen to enter press on input element
    this.input.addEventListener('keyup', function onInputKeyUp(e) {
      if (e.key === 'Enter') {
        if (self.textBefore === self.input.value) { return; }
        self.textBefore = self.input.value;
        self.dispatchEvent(new CustomEvent('onChange', {
          bubbles: true, // Allows the event to bubble up the DOM tree
          composed: true, // Allows the event to pass through Shadow DOM boundaries
          detail: self.input.value
        }));
        self.input.blur();
      }
    });
    const updateInputLength = () => {
      if (this.type === 'text') {
        this.input.size = Math.max(1, this.input.value.length);
      } else {
        const length = Math.pow(10, this.input.value.length).toString();
        this.input.max = length;
        this.input.min = '1';
      }
    }
    updateInputLength();
    this.input.addEventListener('input', () => {
      updateInputLength();
    });
  }

  private resetState(value: string) {
    this.textBefore = value;
    this.input.value = value;
    this.input.style.display = 'none';
    this.span.style.display = '';
    this.span.textContent = value;
    this.span.innerHTML = this.getAttribute('type')! === 'text' ? `&quot;${value}&quot;` : value;
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