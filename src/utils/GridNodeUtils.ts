import { GridNodeProps } from "../types/TGridNode";

export const createGridNode = (
  rowIdx: number,
  colIdx: number,
  isStart: boolean,
  isFinish: boolean,
  distance?: number
): GridNodeProps => {
  return {
    colIdx,
    rowIdx,
    isStart,
    isFinish,
    distance: distance || Infinity,
  };
};
