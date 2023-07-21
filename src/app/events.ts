import React from "react";
import { useHooks } from "./hooks";

export const useEvents = (props: ReturnType<typeof useHooks>) => ({
  onEditorChange: React.useRef((text: string) => {
    props.setQuery(text);
  }).current,
  onMouseEnterItem: (id: number) => () => {
    const item = props.items.find(item => item.id === id)!;
    props.setQuery(item.type || '');
    props.setSelectedState(item.state);
  },
  onMouseLeaveItem: React.useRef((/*id: number*/) => () => {
    props.setQuery('');
    props.setSelectedState(null);
  }).current,
})