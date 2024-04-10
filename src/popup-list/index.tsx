import { PopupListProps, PopupOptionProps } from "./consts";
import { IconWrapper, OptionText, PopupOption, PopupOptions } from "./styles";

export const PopupList = (
  props: PopupListProps
) => {
  return (
    <PopupOptions
      showIf={props.showIf}
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
      key={prop.text}
      showIf={prop.showIf}
      $selected={prop.selected}
      onClick={e => {
        e.stopPropagation();
        prop.onClick()
      }}
      children={
        <>
          <IconWrapper
            showIf={!!prop.icon}
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
