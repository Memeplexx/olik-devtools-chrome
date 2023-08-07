import { connectOlikDevtoolsToStore } from "olik";
import React from "react";
import { appStore } from "../store";



export const useHooks = () => {
  const num = appStore.num.$useState();
  React.useEffect(() => {
    connectOlikDevtoolsToStore({ trace: true });
  }, []);
  return {
    num
  }
}