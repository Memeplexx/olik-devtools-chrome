import { ForwardedRef, forwardRef } from "react";
import { FaCopy, FaEdit, FaTrash } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { is, useForwardedRef } from "../shared/functions";
import { OptionsProps } from "./constants";
import { PopupOption, PopupOptions } from "./styles";


export const Options = forwardRef(function Options(
  { onAddToArray, onAddToObject, onCopy, onDelete, onEditKey, state, onHide }: OptionsProps & { onHide: () => unknown },
  forwardedRef: ForwardedRef<HTMLSpanElement>
) {
  const ref = useForwardedRef<HTMLSpanElement>(forwardedRef);
  const onClickCopy = () => {
    onCopy();
    onHide();
  }
  const onClickDelete = () => {
    onDelete();
    onHide();
  }
  const onClickAddToArray = () => {
    if (!is.array(state)) throw new Error('not an array');
    const val = getSimplifiedObjectPayload(state[0]);
    onAddToArray(val);
    onHide();
  }
  const onClickAddToObject = () => {
    onAddToObject();
    onHide();
  }
  const onClickEditKey = () => {
    onEditKey();
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
            onClick={onClickEditKey}
            children={
              <>
                <FaEdit />
                edit object key
              </>
            }
          />
          <PopupOption
            onClick={onClickCopy}
            children={
              <>
                <FaCopy />
                copy node
              </>
            }
          />
          <PopupOption
            onClick={onClickDelete}
            children={
              <>
                <FaTrash />
                delete node
              </>
            }
          />
          <PopupOption
            showIf={is.array(state)}
            onClick={onClickAddToArray}
            children={
              <>
                <IoMdAdd />
                add array element
              </>
            }
          />
          <PopupOption
            showIf={is.record(state)}
            onClick={onClickAddToObject}
            children={
              <>
                <IoMdAdd />
                add to object
              </>
            }
          />
        </>
      }
    />
  );
});
