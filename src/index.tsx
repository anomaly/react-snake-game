import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { SnakeGameConfig, useSnakeGame } from "./useSnakeGame";

export { useSnakeGame };

export type Props = {
    className?: string;
    numOfTilesX: SnakeGameConfig["numOfTiles"]["x"];
    numOfTilesY: SnakeGameConfig["numOfTiles"]["y"];
    tileColor: SnakeGameConfig["colors"]["tile"];
    borderColor: SnakeGameConfig["colors"]["border"];
    snakeColors: SnakeGameConfig["colors"]["snake"];
    appleColor: SnakeGameConfig["colors"]["apple"];
} & Omit<SnakeGameConfig, "numOfTiles" | "colors">;

const SnakeGame = ({
    className,
    numOfTilesX,
    numOfTilesY,
    tileColor,
    borderColor,
    snakeColors,
    appleColor,
    ...rest
}: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const numOfTiles = useMemo(
        () => ({
            x: numOfTilesX,
            y: numOfTilesY,
        }),
        [numOfTilesX, numOfTilesY]
    );

    const { props: canvasProps, state, methods } = useSnakeGame(canvasRef, {
        ...rest,
        numOfTiles,
        colors: {
            tile: tileColor,
            border: borderColor,
            snake: snakeColors,
            apple: appleColor,
        },
    });

    const handleKeyDown = useCallback(
        (event) => {
            if (event.key === " " && !state.started) {
                canvasRef.current && canvasRef.current.focus();
                methods.resetGame(true);
            }
        },
        [methods, state.started]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    return <canvas className={className} ref={canvasRef} {...canvasProps} />;
};

SnakeGame.defaultProps = {
    smoothAnimations: false,
    speed: 25,
    multiplier: 3,
    tileSize: 25,
    numOfTilesX: 32,
    numOfTilesY: 18,
    tileColor: "#ebedf0",
    borderColor: "#fff",
    snakeColors: ["#216e39", "#30a14e", "#40c463", "#9be9a8"],
    appleColor: "#ea4a5a",
};

export default SnakeGame;
