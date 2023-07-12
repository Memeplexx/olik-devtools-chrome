import styled from "styled-components";
import { useHooks } from "./hooks";
import { EditorProps } from "./constants";


export const Editor = ({ state, onChange, ...props }: EditorProps) => {
	const hooks = useHooks({ state, onChange });
  return (
    <div {...props}>
      <EditorPane ref={hooks.divEl} />
    </div>
  );
}

const EditorPane = styled.div`
	flex: 1;
	height: 18px;
`;