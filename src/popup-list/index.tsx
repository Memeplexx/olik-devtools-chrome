import { PopupListProps } from "./consts";
import { PopupOption, PopupOptions } from "./styles";

export const PopupList = (
  props: PopupListProps
) => {
  return (
    <PopupOptions
      showIf={props.showIf}
      $position={props.position ?? 'right'}
      children={
        props.children.map(prop => (
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
                {prop.icon && <prop.icon />}
                {prop.text}
              </>
            }
          />
        ))
      }
    />
  )
}
