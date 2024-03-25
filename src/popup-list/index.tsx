import { PopupListProps } from "./consts";
import { OptionText, PopupOption, PopupOptions } from "./styles";

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
                {prop.icon && <prop.icon style={{width: '12px', height: '12px'}} />}
                <OptionText
                  children={prop.text}
                />
              </>
            }
          />
        ))
      }
    />
  )
}
