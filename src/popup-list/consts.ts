import { IconType } from "react-icons"

export type PopupListProps = {
  children: {
    onClick: () => unknown,
    icon?: IconType,
    text: string,
    showIf?: boolean,
    selected?: boolean,
  }[],
  showIf?: boolean
}