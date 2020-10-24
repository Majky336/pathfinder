import React, { FC } from "react";
import cx from "classnames";

import { GridNodeProps } from "../../types/TGridNode";

import "./GridNode.css";

const GridNode: FC<GridNodeProps & { id: string }> = ({
  colIdx,
  rowIdx,
  distance,
  id,
  isFinish,
  isStart,
  isVisited,
}) => {
  return (
    <div
      className={cx("node", {
        "visited-node": isVisited && !isStart && !isFinish,
        "start-node": isStart,
        "finish-node": isFinish,
      })}
      id={id}
    />
  );
};

export default GridNode;
