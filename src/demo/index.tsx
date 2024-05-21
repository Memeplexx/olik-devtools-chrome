import { useInputs } from './inputs';
import { Container, SimpleButton } from './styles';
import { useOutputs } from './outputs';


export const Demo = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const inputs = useInputs();
  const outputs = useOutputs(inputs);
  return (
    <Container
      {...props}
      children={
        <>
          <SimpleButton
            children={`increment | ${inputs.num}`}
            onClick={outputs.increment}
          />
          <SimpleButton
            children='patch'
            onClick={outputs.patch}
          />
          <SimpleButton
            children='patch2'
            onClick={outputs.patch2}
          />
          <SimpleButton
            children='patchDeep'
            onClick={outputs.patchDeep}
          />
          <SimpleButton
            children='toggle'
            onClick={outputs.toggle}
          />
          <SimpleButton
            children='toggle modal'
            onClick={outputs.toggleModal}
          />
          <SimpleButton
            children='long stacktrace'
            onClick={outputs.onClickLongStackTrace}
          />
          <SimpleButton
            children='set'
            onClick={outputs.set} />
          <SimpleButton
            children='push'
            onClick={outputs.push}
          />
          <SimpleButton
            children='delete'
            onClick={outputs.delete}
          />
          <SimpleButton
            children='find & set'
            onClick={outputs.findAndSet}
          />
          <SimpleButton
            children='merge matching arr'
            onClick={outputs.mergeMatchingArr}
          />
          <SimpleButton
            children='merge matching sing'
            onClick={outputs.mergeMatchingSing}
          />
          <SimpleButton
            children='set new'
            onClick={outputs.setNew}
          />
          <SimpleButton
            children='set date'
            onClick={outputs.setDate}
          />
          <SimpleButton
            children='set empty array'
            onClick={outputs.setEmptyArray}
          />
          <SimpleButton
            children='set empty array deep'
            onClick={outputs.setEmptyArrayDeep}
          />
          <SimpleButton
            children='set empty array deep 2'
            onClick={outputs.setEmptyArrayDeep2}
          />
        </>
      }
    />
  )
};



