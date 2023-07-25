import { useHooks } from "./hooks";
import { TreeProps } from "./constants";
import { JsonWrapper, ScrollPane } from "./styles";


export const Tree = (props: TreeProps) => {
  const hooks = useHooks(props);
  return (
    <ScrollPane
      className={props.className}
      children={
        <JsonWrapper
          dangerouslySetInnerHTML={{__html: hooks}}
        />
      }
    />
  );
}
