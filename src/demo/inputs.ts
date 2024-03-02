import { connectOlikDevtoolsToStore } from "olik/devtools";
import React from "react";
import { appStore } from "../store";



export const useInputs = () => {
  const num = appStore.num.$useState();
  React.useEffect(() => {
    connectOlikDevtoolsToStore({ trace: true });
  }, []);
  return {
    num
  }
}