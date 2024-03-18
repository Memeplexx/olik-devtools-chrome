import { useRef, useState } from "react";
import { FaCopy } from "react-icons/fa";
import { is } from "../shared/functions";
import { CompactInput } from "./compact-input";
import { PopupOption, PopupOptions } from "./styles";
import { deserialize } from "olik";


export const Options = ({ onAddToArray, onAddToObject, onCopy, onDelete, state }: { onCopy: () => unknown, onDelete: () => unknown, onAddToArray: (value: unknown) => void, onAddToObject: (key: string, value: unknown) => unknown, state: unknown }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inputKeyRef = useRef<HTMLInputElement>(null);
  const inputValRef = useRef<HTMLInputElement>(null);
  const [showInput, setShowInput] = useState(false);
  if (!ref.current) {
    setTimeout(() => {
      const el = ref.current!.parentNode as HTMLElement;
      el.style.position = 'relative';
      el.addEventListener('mouseover', () => ref.current!.style.display = 'flex');
      el.addEventListener('mouseout', () => ref.current!.style.display = 'none');
    })
  }
  const onClickCopy = () => {
    onCopy();
    reset();
  }
  const onClickDelete = () => {
    onDelete();
    reset();
  }
  const onClickAddToArray = () => {
    if (!is.array(state)) throw new Error('not an array');
    const val = getSimplifiedObjectPayload(state[0]);
    onAddToArray(val);
    reset();
  }
  const onClickAddToObject = () => {
    setShowInput(true);
    setTimeout(() => inputKeyRef.current!.focus());
  }
  const reset = () => {
    setShowInput(false);
    inputKeyRef.current!.value = '';
    inputValRef.current!.value = '';
    ref.current!.style.display = 'none';
  }
  const onChange = () => {
    const key = inputKeyRef.current!.value;
    const val = inputValRef.current!.value;
    if (key && val) {
      onAddToObject(key, deserialize(val));
      reset();
    }
  }
  const getSimplifiedObjectPayload = (state: unknown) => {
    const recurse = (val: unknown): unknown => {
      if (is.record(val)) {
        const r = {} as Record<string, unknown>;
        Object.keys(val).forEach(key => r[key] = recurse(val[key]));
        return r;
      } else if (is.array(val)) {
        return val.map(recurse);
      } else if (is.number(val)) {
        return 0;
      } else if (is.boolean(val)) {
        return false;
      } else if (is.date(val)) {
        return new Date();
      } else if (is.string(val)) {
        return '';
      } else if (is.null(val)) {
        return null;
      } else {
        throw new Error('unhandled type');
      }
    }
    return recurse(state);
  }
  return (
    <PopupOptions
      ref={ref}
      onClick={e => e.stopPropagation()}
      children={
        <>
          <PopupOption
            showIf={!showInput}
            onClick={onClickCopy}
            children={
              <>
                <FaCopy />
                copy
              </>
            }
          />
          <PopupOption
            showIf={!showInput}
            onClick={onClickDelete}
            children={
              <>
                <FaCopy />
                delete
              </>
            }
          />
          <PopupOption
            showIf={!showInput && is.array(state)}
            onClick={onClickAddToArray}
            children={
              <>
                <FaCopy />
                add
              </>
            }
          />
          <PopupOption
            showIf={!showInput && is.record(state)}
            onClick={onClickAddToObject}
            children={
              <>
                <FaCopy />
                add
              </>
            }
          />
          <PopupOption
            showIf={showInput}
            children={
              <>
                {'{'}
                <CompactInput
                  ref={inputKeyRef}
                  value={''}
                  minWidth={5}
                />
                :
                <CompactInput
                  ref={inputValRef}
                  onChange={onChange}
                  value={''}
                />
                {'}'}
              </>
            }
          />
        </>
      }
    />
  );
}