import React, { useEffect, useRef, useState } from "react";

import { dijkstra, getShortestPath } from "../../alghoritms/dijkstra";
import { GridNodeProps } from "../../types/TGridNode";
import { drawBorder, getFillStyle } from "../../utils/CanvasUtils";
import { createGridNode } from "../../utils/GridNodeUtils";

import "./Grid.css";

const NO_ROWS = 50;
const NO_COLUMNS = 25;

const START_NODE = { rowIdx: 10, colIdx: 15 };
const FINISH_NODE = { rowIdx: 30, colIdx: 20 };

const Grid = () => {
  const getInitialGrid = (randomizeDistances?: boolean) => {
    const grid = [];

    for (let rowIdx = 0; rowIdx < NO_ROWS; rowIdx++) {
      const row = [];

      for (let colIdx = 0; colIdx < NO_COLUMNS; colIdx++) {
        const isStart =
          colIdx === START_NODE.colIdx && rowIdx === START_NODE.rowIdx;
        const isFinish =
          colIdx === FINISH_NODE.colIdx && rowIdx === FINISH_NODE.rowIdx;

        const distance = randomizeDistances ? getRandomDistance() : Infinity;

        row.push(createGridNode(rowIdx, colIdx, isStart, isFinish, distance));
      }

      grid.push(row);
    }

    return grid;
  };

  const getRandomDistance = () => {
    return Math.floor(Math.random() * Math.floor(100));
  };

  const [grid, setGrid] = useState<GridNodeProps[][]>(getInitialGrid());
  const [isMakingWalls, setIsMakingWalls] = useState(false);
  const [currentNode, setCurrentNode] = useState<GridNodeProps | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const runDijkstra = () => {
    const deepCloneGrid = grid.map((row) => [
      ...row.map((col) => ({ ...col })),
    ]);

    const startNode = deepCloneGrid[START_NODE.rowIdx][START_NODE.colIdx];
    const finishNode = deepCloneGrid[FINISH_NODE.rowIdx][FINISH_NODE.colIdx];

    const result = dijkstra(deepCloneGrid, startNode, finishNode);

    if (!result) {
      return;
    }

    animateDijkstra(result?.visitedNodes, result?.grid);
  };

  const animateShortestPath = (shortestPath: GridNodeProps[] | undefined) => {
    if (!shortestPath) {
      return;
    }

    for (let i = 0; i <= shortestPath.length; i++) {
      setTimeout(() => {
        const node = shortestPath[i];

        if (node) {
          grid[node?.rowIdx][node?.colIdx].isShortestPath = true;
        }
        drawGrid(canvasRef.current?.getContext("2d"), grid);
      }, i * 10);
    }
  };

  const animateDijkstra = (
    visitedNodes: GridNodeProps[],
    paintGrid?: GridNodeProps[][]
  ) => {
    const finishNode = paintGrid?.[FINISH_NODE.rowIdx][FINISH_NODE.colIdx];
    const shortestPath = getShortestPath(finishNode);

    for (let i = 0; i <= visitedNodes.length; i++) {
      setTimeout(() => {
        const node = visitedNodes[i];

        if (i === visitedNodes.length) {
          animateShortestPath(shortestPath);
        }

        if (node) {
          grid[node?.rowIdx][node?.colIdx].isVisited = true;
        }
        drawGrid(canvasRef.current?.getContext("2d"), grid);
      }, i * 10);
    }
  };

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");

    drawGrid(context, grid);
  }, [grid]);

  const drawGrid = (
    context: CanvasRenderingContext2D | null | undefined,
    grid: GridNodeProps[][]
  ) => {
    if (!context) {
      return null;
    }

    for (const row of grid) {
      for (const node of row) {
        drawBorder(context, node.rowIdx * 20, node.colIdx * 20, 20, 20);
        context.fillStyle = getFillStyle(node);
        context.fillRect(node.rowIdx * 20, node.colIdx * 20, 20, 20);
      }
    }
  };

  const clearGrid = () => {
    setGrid(getInitialGrid());
    const context = canvasRef.current?.getContext("2d");

    if (!context) {
      return;
    }

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    drawGrid(context, grid);
  };

  const handleOnCanvasMouseDown = () => {
    setIsMakingWalls(true);
  };

  const handleOnMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const cx = event.pageX;
    const cy = event.pageY;

    const canvasRect = canvasRef.current?.getBoundingClientRect();

    if (!canvasRect) {
      return;
    }

    const x = cx - canvasRect.left;
    const y = cy - canvasRect.top;

    const rowIdx = Math.floor(x / 20);
    const colIdx = Math.floor(y / 20);

    const targetNode = grid[rowIdx][colIdx];

    if (isMakingWalls) {
      if (targetNode !== undefined && !targetNode.isWall) {
        targetNode.isWall = true;
      }

      setGrid([...grid]);
    }

    setCurrentNode(targetNode);
  };

  const handleOnCanvasMouseUp = () => {
    setIsMakingWalls(false);
  };

  const getRandomDistanceGrid = () => {
    const randomGrid = getInitialGrid(true);

    setGrid(randomGrid);
  };

  return (
    <div className="grid">
      <div className="header">
        <button onClick={() => runDijkstra()}>
          Visualise Dijkstras alghoritm
        </button>
        <button onClick={() => clearGrid()}>Clear grid</button>
        <button onClick={() => getRandomDistanceGrid()}>
          Create grid with random distances
        </button>
      </div>
      <div className="grid-canvas">
        <canvas
          className="canvas"
          onMouseDown={handleOnCanvasMouseDown}
          onMouseUp={handleOnCanvasMouseUp}
          onMouseMove={handleOnMouseMove}
          id="canvas"
          ref={canvasRef}
          width={50 * 20}
          height={25 * 20}
        />
      </div>
      {currentNode && (
        <div>
          <h3>Current node data</h3>(
          <pre>
            <code>{JSON.stringify(currentNode, null, 4)}</code>
          </pre>
          )
        </div>
      )}
    </div>
  );
};

export default Grid;
