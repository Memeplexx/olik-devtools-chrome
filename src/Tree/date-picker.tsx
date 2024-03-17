import flatpickr from "flatpickr";
import 'flatpickr/dist/flatpickr.css';
import { useRef } from "react";


export const DatePicker = (props: { value: Date, onChange: (date: Date) => void }) => {
  const ref = useRef<HTMLSpanElement>(null);
  if (!ref.current) {
    setTimeout(() => {
      flatpickr(ref.current!, {
        enableTime: true,
        defaultDate: props.value,
        formatDate: d => d.toISOString(),
        onClose: function onChangeFlatpickr(s) {
          props.onChange(s[0]);
        },
      })
    })
  }
  return (
    <span
      ref={ref}
      children={props.value.toISOString()}
    />
  );
}
