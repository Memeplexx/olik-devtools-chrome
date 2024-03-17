import flatpickr from "flatpickr";
import 'flatpickr/dist/flatpickr.css';
import { useRef } from "react";
import { DatePickerContainer } from "./styles";
import { DatePickerProps } from "./constants";


export const DatePicker = (props: DatePickerProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const changed = useRef(false);
  if (!ref.current) {
    setTimeout(() => {
      flatpickr(ref.current!, {
        enableTime: true,
        defaultDate: props.value,
        formatDate: d => d.toISOString(),
        onChange: () => changed.current = true,
        onOpen: () => changed.current = false,
        onClose: function onChangeFlatpickr(s) {
          if (!changed.current) { return; }
          props.onChange(s[0]);
        },
      })
    })
  }
  return (
    <DatePickerContainer
      ref={ref}
      children={props.value.toISOString()}
    />
  );
}
