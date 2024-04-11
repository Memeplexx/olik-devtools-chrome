import { PopupListProps, PopupOptionProps } from "./consts";
import { IconWrapper, OptionText, PopupOption, PopupOptions } from "./styles";

export const PopupList = (
  props: PopupListProps
) => {
  return (
    <PopupOptions
      if={props.if}
      $position={props.position ?? 'right'}
      children={props.children}
    />
  )
}

export const IconOption = (
  prop: PopupOptionProps,
) => {
  return (
    <PopupOption
      if={prop.if}
      key={prop.text}
      $selected={prop.selected}
      onClick={e => {
        e.stopPropagation();
        prop.onClick()
      }}
      children={
        <>
          <IconWrapper
            if={!!prop.icon}
            children={prop.icon && <prop.icon />}
          />
          <OptionText
            children={prop.text}
          />
        </>
      }
    />
  );
}
