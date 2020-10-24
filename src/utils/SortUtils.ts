import { GridNodeProps } from "../types/TGridNode";

const swap = (input: Array<any>, indexA: number, indexB: number) => {
  const temp = input[indexA];

  input[indexA] = input[indexB];
  input[indexB] = temp;
};

const minHeap = (input: GridNodeProps[], index: number) => {
  const left = 2 * index + 1;
  const right = 2 * index + 2;

  let min = index;

  if (left < input.length && input[left]?.distance < input[min]?.distance) {
    min = left;
  }

  if (right < input.length && input[right]?.distance < input[min]?.distance) {
    min = right;
  }

  if (min !== index) {
    swap(input, index, min);
    minHeap(input, min);
  }
};

export const heapSort = (input: GridNodeProps[]) => {
  let length = input.length;

  for (let i = Math.floor(length / 2); i >= 0; i -= 1) {
    minHeap(input, i);
  }

  // for (let i = input.length - 1; i > 0; i--) {
  //   swap(input, 0, i);
  //   length--;

  //   minHeap(input, 0);
  // }
};
