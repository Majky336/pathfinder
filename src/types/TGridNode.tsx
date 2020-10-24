export type GridNodeProps = {
  colIdx: number;
  rowIdx: number;
  isStart: boolean;
  isFinish: boolean;
  distance: number;
  isVisited?: boolean;
  isShortestPath?: boolean;
  isWall?: boolean;
  previousNode?: GridNodeProps;
};
