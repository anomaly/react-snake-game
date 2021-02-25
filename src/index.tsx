import { contain } from "intrinsic-scale";
import React, {
    ComponentProps,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useResizeDetector } from "react-resize-detector";
import { SnakeGameConfig, useSnakeGame } from "./useSnakeGame";

export { useSnakeGame };

export type SnakeGameProps = {
    className?: string;
    numOfTilesX: SnakeGameConfig["numOfTiles"]["x"];
    numOfTilesY: SnakeGameConfig["numOfTiles"]["y"];
    tileColor: SnakeGameConfig["colors"]["tile"];
    borderColor: SnakeGameConfig["colors"]["border"];
    snakeColors: SnakeGameConfig["colors"]["snake"];
    appleColor: SnakeGameConfig["colors"]["apple"];
} & Omit<SnakeGameConfig, "numOfTiles" | "colors"> &
    ComponentProps<"canvas">;

export const SnakeGame = ({
    className,
    numOfTilesX,
    numOfTilesY,
    tileColor,
    borderColor,
    snakeColors,
    appleColor,
    smoothAnimations,
    speed,
    multiplier,
    tileSize,
    ...rest
}: SnakeGameProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const numOfTiles = useMemo(
        () => ({
            x: numOfTilesX,
            y: numOfTilesY,
        }),
        [numOfTilesX, numOfTilesY]
    );

    const [autoTileSize, setAutoTileSize] = useState<number | undefined>();

    const { props: canvasProps, state, methods } = useSnakeGame(canvasRef, {
        smoothAnimations,
        speed,
        multiplier,
        tileSize: autoTileSize ?? tileSize,
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
                event.preventDefault();
                canvasRef.current?.focus();
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

    const { width, height } = useResizeDetector({ targetRef: canvasRef });

    useEffect(() => {
        const currCanvas = canvasRef.current;
        const context = currCanvas?.getContext("2d");

        if (currCanvas && context && width && height && !tileSize) {
            if (!tileSize) {
                setAutoTileSize(
                    Math.min(width / numOfTilesX, height / numOfTilesY)
                );
            }
        }
    }, [
        width,
        height,
        tileSize,
        numOfTilesX,
        numOfTilesY,
        canvasProps.width,
        canvasProps.height,
        state.started,
    ]);

    useEffect(() => {
        const currCanvas = canvasRef.current;
        const context = currCanvas?.getContext("2d");

        if (currCanvas && context && tileSize) {
            const originalWidth = canvasProps.width;
            const originalHeight = canvasProps.height;

            const dimensions = contain(
                currCanvas.clientWidth,
                currCanvas.clientHeight,
                originalWidth,
                originalHeight
            );

            const devicePixelRatio = window.devicePixelRatio || 1;

            currCanvas.width = dimensions.width * devicePixelRatio;
            currCanvas.height = dimensions.height * devicePixelRatio;

            const ratio =
                Math.min(
                    currCanvas.clientWidth / originalWidth,
                    currCanvas.clientHeight / originalHeight
                ) * devicePixelRatio;

            context.scale(ratio, ratio);
        }
    }, [
        tileSize,
        numOfTilesX,
        numOfTilesY,
        canvasProps.width,
        canvasProps.height,
        state.started,
    ]);

    return (
        <canvas
            style={{ objectFit: "contain" }}
            className={className}
            ref={canvasRef}
            {...canvasProps}
            {...rest}
        />
    );
};

SnakeGame.defaultProps = {
    smoothAnimations: false,
    speed: 25,
    tileSize: 20,
    multiplier: 3,
    numOfTilesX: 32,
    numOfTilesY: 18,
    tileColor: "#ebedf0",
    borderColor: "#fff",
    snakeColors: ["#216e39", "#30a14e", "#40c463", "#9be9a8"],
    appleColor: "#ea4a5a",
};
