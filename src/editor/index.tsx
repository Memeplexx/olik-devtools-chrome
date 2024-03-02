import { useInputs } from "./inputs";
import { EditorProps } from "./constants";
import { Container, EditorPane } from "./styles";
import { usePropsWithoutFunctions } from "../shared/functions";


export const Editor = (props: EditorProps) => {
  const inputs = useInputs(props);
  const propsRev = usePropsWithoutFunctions(props);
  return (
    <Container 
      {...propsRev}
      children={
        <EditorPane
          ref={inputs.divEl}
        />
      }
    />
  );
}

