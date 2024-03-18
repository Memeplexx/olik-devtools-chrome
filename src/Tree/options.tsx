import { deserialize } from "olik";
import { ForwardedRef, forwardRef, useRef, useState } from "react";
import { FaCopy, FaEdit, FaTrash } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { is, useForwardedRef } from "../shared/functions";
import { CompactInput } from "./compact-input";
import { OptionsProps } from "./constants";
import { PopupOption, PopupOptions } from "./styles";


const Options = forwardRef(function Options(
  { onAddToArray, onAddToObject, onCopy, onDelete, onEditKey, state, onHide }: OptionsProps & { onHide: () => unknown },
  forwardedRef: ForwardedRef<HTMLSpanElement>
) {
  const ref = useForwardedRef<HTMLSpanElement>(forwardedRef);
  const inputKeyRef = useRef<HTMLInputElement>(null);
  const inputValRef = useRef<HTMLInputElement>(null);
  const [showInput, setShowInput] = useState(false);
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
  const onClickEditKey = () => {
    onEditKey();
  }
  const reset = () => {
    setShowInput(false);
    if (inputKeyRef.current && inputValRef.current) {
      inputKeyRef.current.value = '';
      inputValRef.current.value = '';
    }
    onHide();
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
                copy node
              </>
            }
          />
          <PopupOption
            showIf={!showInput}
            onClick={onClickDelete}
            children={
              <>
                <FaTrash />
                delete node
              </>
            }
          />
          <PopupOption
            showIf={!showInput && is.array(state)}
            onClick={onClickAddToArray}
            children={
              <>
                <IoMdAdd />
                add array element
              </>
            }
          />
          <PopupOption
            showIf={!showInput && is.record(state)}
            onClick={onClickAddToObject}
            children={
              <>
                <IoMdAdd />
                add to object
              </>
            }
          />
          <PopupOption
            showIf={!showInput && is.record(state)}
            onClick={onClickEditKey}
            children={
              <>
                <FaEdit />
                edit object key
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
});

export const OptionsWrapper = (props: OptionsProps) => {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const refParent = useRef<HTMLElement | null>(null);
  if (!ref.current) {
    setTimeout(() => {
      refParent.current = ref.current!.parentNode as HTMLElement;
      refParent.current.style.position = 'relative';
      refParent.current.addEventListener('mouseover', () => setShow(true));
      refParent.current.addEventListener('mouseout', () => setShow(false));
    })
  }
  return (
    <span
      ref={ref}
      children={show && !!refParent.current && (
        <Options
          {...props}
          ref={ref}
          onHide={() => setShow(false)}
        />
      )}
    />
  )
}