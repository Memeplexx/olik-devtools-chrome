import { useHooks } from "./hooks";
import { EditorProps } from "./constants";
import { Container, EditorPane } from "./styles";
import { usePropsWithoutFunctions } from "../shared/functions";


export const Editor = (props: EditorProps) => {
  const hooks = useHooks(props);
  const propsRev = usePropsWithoutFunctions(props);
  return (
    <Container 
      {...propsRev}
      inside={
        <EditorPane
          ref={hooks.divEl}
        />
      }
    />
  );
}

