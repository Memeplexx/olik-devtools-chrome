import { IconType } from "react-icons"


export type Position = 'right' | 'below' | 'above' | 'left';
export type PopupListProps = {
  children: {
    onClick: () => unknown,
    icon?: IconType,
    text: string,
    showIf?: boolean,
    selected?: boolean,
  }[],
  showIf?: boolean
  position: Position,
}