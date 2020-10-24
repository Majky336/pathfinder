import React, { useRef, useEffect, CanvasHTMLAttributes } from "react";

type Props = {
  draw: (
    context: CanvasRenderingContext2D | null | undefined,
    frameCount?: number
  ) => void;
  drawDelay?: number;
};

const Canvas = (props: Props & CanvasHTMLAttributes<HTMLCanvasElement>) => {
  const { draw, drawDelay, ...rest } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    let frameCount = 0;
    let animationFrameId = -1;

    const render = () => {
      frameCount++;

      if (drawDelay) {
        setInterval(() => draw(context, frameCount), drawDelay);
      } else {
        draw(context, frameCount);
      }
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw, drawDelay]);

  return <canvas ref={canvasRef} {...rest} />;
};

export default Canvas;
