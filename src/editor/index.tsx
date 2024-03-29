import { useInputs } from "./inputs";
import { Props } from "./constants";
import { Container, EditorPane } from "./styles";
import { useKnownPropsOnly } from "../shared/functions";


export const Editor = (props: Props) => {
  const inputs = useInputs(props);
  const propsRev = useKnownPropsOnly(document?.createElement('div') ?? {}, props);
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

