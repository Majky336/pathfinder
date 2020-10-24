import { GridNodeProps } from "../types/TGridNode";
import { heapSort } from "../utils/SortUtils";

const getAllNodes = (grid: GridNodeProps[][]): GridNodeProps[] => {
  const nodes = [];

  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }

  return nodes;
};

const sortByDistance = (nodeA: GridNodeProps, nodeB: GridNodeProps) =>
  nodeA.distance - nodeB.distance;

const getInitialNeighbours = (
  grid: GridNodeProps[][],
  finishNode: GridNodeProps
) => {
  const { colIdx, rowIdx } = finishNode;

  const neighbors = [];

  if (rowIdx > 0) neighbors.push(grid[rowIdx - 1][colIdx]);
  if (rowIdx < grid.length - 1) neighbors.push(grid[rowIdx + 1][colIdx]);
  if (colIdx > 0) neighbors.push(grid[rowIdx][colIdx - 1]);
  if (colIdx < grid[0].length - 1) neighbors.push(grid[rowIdx][colIdx + 1]);

  return neighbors;
};

export const dijkstra = (
  grid: GridNodeProps[][],
  startNode: GridNodeProps,
  finishNode: GridNodeProps
) => {
  const visitedNodes = [];
  startNode.distance = 0;

  const initialNonVisitedNodes = getInitialNeighbours(grid, startNode);
  let nonVisitedNodes = [startNode, ...initialNonVisitedNodes].sort(
    sortByDistance
  );

  while (nonVisitedNodes.length > 0) {
    heapSort(nonVisitedNodes);
    const closestNode = nonVisitedNodes.shift();

    if (!closestNode) {
      return { visitedNodes };
    }

    if (closestNode?.isWall) continue;

    if (closestNode?.distance === Infinity) {
      return { visitedNodes };
    }

    visitedNodes.push(closestNode);
    closestNode.isVisited = true;

    if (closestNode === finishNode) {
      return { visitedNodes, grid };
    }

    if (finishNode.isVisited) {
      return { visitedNodes, grid };
    }

    updateNeighbours(closestNode, grid).forEach((neighbour) => {
      nonVisitedNodes.push(neighbour);
    });
  }
};

const updateNeighbours = (node: GridNodeProps, grid: GridNodeProps[][]) => {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);

  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + getNodeDistance(neighbor);
    neighbor.previousNode = node;
  }

  return unvisitedNeighbors;
};

const getNodeDistance = (node: GridNodeProps) => {
  if (node.distance !== Infinity) {
    return node.distance;
  }

  return 1;
};

const getUnvisitedNeighbors = (
  node: GridNodeProps,
  grid: GridNodeProps[][]
) => {
  const { colIdx, rowIdx } = node;

  const neighbors = [];

  if (rowIdx > 0) neighbors.push(grid[rowIdx - 1][colIdx]);
  if (rowIdx < grid.length - 1) neighbors.push(grid[rowIdx + 1][colIdx]);
  if (colIdx > 0) neighbors.push(grid[rowIdx][colIdx - 1]);
  if (colIdx < grid[0].length - 1) neighbors.push(grid[rowIdx][colIdx + 1]);

  return neighbors.filter((neighbor) => !neighbor.isVisited);
};

export const getShortestPath = (finishNode?: GridNodeProps) => {
  const shortestPath = [];

  let currentNode = finishNode;

  while (currentNode) {
    if (!currentNode.previousNode) {
      return shortestPath;
    }

    shortestPath.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }

  return shortestPath;
};
