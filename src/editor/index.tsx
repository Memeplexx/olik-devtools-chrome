import { useHooks } from "./hooks";
import { EditorProps } from "./constants";
import { Container, EditorPane } from "./styles";


export const Editor = ({ state, onChange, query, ...props }: EditorProps) => {
  const hooks = useHooks({ state, onChange, query });
  return (
    <Container 
      {...props}
      inside={
        <EditorPane
          ref={hooks.divEl}
        />
      }
    />
  );
}

