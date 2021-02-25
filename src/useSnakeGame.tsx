import {
    KeyboardEvent,
    RefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import useAnimationFrame from "./useAnimationFrame";

export const MOVE_DIRECTIONS = {
    LEFT: [-1, 0],
    UP: [0, -1],
    RIGHT: [1, 0],
    DOWN: [0, 1],
};

export type MoveDirectionKeys = keyof typeof MOVE_DIRECTIONS;
export type MoveDirectionValues = typeof MOVE_DIRECTIONS[MoveDirectionKeys];

const KEY_TO_DIRECTION_MAPPINGS: { [key: string]: MoveDirectionValues } = {
    w: MOVE_DIRECTIONS.UP,
    a: MOVE_DIRECTIONS.LEFT,
    s: MOVE_DIRECTIONS.DOWN,
    d: MOVE_DIRECTIONS.RIGHT,

    k: MOVE_DIRECTIONS.UP,
    h: MOVE_DIRECTIONS.LEFT,
    j: MOVE_DIRECTIONS.DOWN,
    l: MOVE_DIRECTIONS.RIGHT,

    // IE/Edge
    Left: MOVE_DIRECTIONS.LEFT,
    Up: MOVE_DIRECTIONS.UP,
    Right: MOVE_DIRECTIONS.RIGHT,
    Down: MOVE_DIRECTIONS.DOWN,

    // Other
    ArrowLeft: MOVE_DIRECTIONS.LEFT,
    ArrowUp: MOVE_DIRECTIONS.UP,
    ArrowRight: MOVE_DIRECTIONS.RIGHT,
    ArrowDown: MOVE_DIRECTIONS.DOWN,
};

const getRandomInt = (max: number) => Math.floor(Math.random() * max);

const getRandomIntMinMax = (min: number, max: number) =>
    Math.floor(max) - getRandomInt(max - min);

export type Position = [number, number];

export type SnakeGameConfig = {
    smoothAnimations: boolean;
    speed: number;
    multiplier: number; // speed mulitplier when key is held
    tileSize: number; // in px
    numOfTiles: { x: number; y: number };
    colors: {
        tile: string;
        border: string;
        snake: string[];
        apple: string;
    };
};

export type Snake = Position[];
export type Apple = Position;

export type GameState = {
    started: boolean;
    snake?: Snake;
    snakeInProgress?: Snake;
    apple?: Apple;
    direction?: MoveDirectionValues;
};

export const useSnakeGame = (
    canvasRef: RefObject<HTMLCanvasElement>,
    {
        smoothAnimations,
        speed,
        multiplier,
        tileSize,
        numOfTiles,
        colors,
    }: SnakeGameConfig = {
        smoothAnimations: false,
        speed: 50,
        multiplier: 2,
        tileSize: 10,
        numOfTiles: { x: 10, y: 10 },
        colors: {
            tile: "#ebedf0",
            border: "#fff",
            snake: ["#216e39", "#30a14e", "#40c463", "#9be9a8"],
            apple: "#ea4a5a",
        },
    }
) => {
    const [gameState, setGameState] = useState<GameState>({ started: false });
    const [currSpeed, setCurrSpeed] = useState(speed);

    const checkIfWillCollideWithWall = useCallback(
        (snakeHead: Position, direction: MoveDirectionValues): Boolean => {
            const nextX = snakeHead[0] + direction[0];
            const nextY = snakeHead[1] + direction[1];
            return (
                nextX < 0 ||
                nextX >= numOfTiles.x ||
                nextY < 0 ||
                nextY >= numOfTiles.y
            );
        },
        [numOfTiles.x, numOfTiles.y]
    );

    const generateRandomSnake = useCallback((): Snake => {
        // Appear in bottom left
        const min_thres = 0.5;
        const max_thres = 0.9;
        const maxX = numOfTiles.x - 1;
        const maxY = numOfTiles.y - 1;
        const snakeHead: Position = [
            getRandomIntMinMax(maxX * min_thres, maxX * max_thres),
            getRandomIntMinMax(maxY * min_thres, maxY * max_thres),
        ];

        let snakeTail: Position;

        const randomPosition = getRandomInt(3);

        switch (randomPosition) {
            case 0:
                snakeTail = [snakeHead[0] + 1, snakeHead[1]];
                break;
            case 1:
                snakeTail = [snakeHead[0], snakeHead[1] + 1];
                break;
            case 2:
                snakeTail = [snakeHead[0] - 1, snakeHead[1]];
                break;
            case 3:
            default:
                snakeTail = [snakeHead[0], snakeHead[1] - 1];
        }

        return [snakeHead, snakeTail];
    }, [numOfTiles.x, numOfTiles.y]);

    const generateRandomApple = useCallback(
        (snake: Snake): Position => {
            let gridArray: Array<Position | null> = [];

            for (let x = 0; x < numOfTiles.x; x++) {
                for (let y = 0; y < numOfTiles.y; y++) {
                    gridArray.push([x, y]);
                }
            }

            for (const position of snake) {
                gridArray[position[0] * position[1]] = null;
            }

            const possibleApple = gridArray.filter(
                (position) => position !== null
            ) as Position[];

            return possibleApple[
                Math.floor(Math.random() * possibleApple.length)
            ];
        },
        [numOfTiles.x, numOfTiles.y]
    );

    const generateRandomDirection = useCallback(
        (snake: Snake): MoveDirectionValues => {
            const forwardDirection =
                snake.length >= 2
                    ? [snake[0][0] - snake[1][0], snake[0][1] - snake[1][1]]
                    : MOVE_DIRECTIONS.UP;

            const possibleDirections = [];

            if (checkIfWillCollideWithWall(snake[0], forwardDirection)) {
                for (const direction of Object.values(MOVE_DIRECTIONS)) {
                    if (
                        (forwardDirection[0] === direction[0] &&
                            forwardDirection[0] === 0 &&
                            forwardDirection[1] === -direction[1]) ||
                        (forwardDirection[1] === direction[1] &&
                            forwardDirection[1] === 0 &&
                            forwardDirection[1] === -direction[1])
                    ) {
                        // Avoid going backwards
                        continue;
                    }

                    if (checkIfWillCollideWithWall(snake[0], direction)) {
                        // Avoid colliding with wall
                        continue;
                    }

                    possibleDirections.push(direction);
                }
            }

            return possibleDirections.length === 0
                ? forwardDirection
                : possibleDirections[
                      Math.floor(Math.random() * possibleDirections.length)
                  ];
        },
        [checkIfWillCollideWithWall]
    );

    const drawCanvas = useCallback(
        (context: CanvasRenderingContext2D) => {
            context.fillStyle = colors.tile;
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);

            // Grid
            for (let x = 0; x <= numOfTiles.x; x++) {
                const posX = x * tileSize;
                context.beginPath();
                context.moveTo(posX, 0);
                context.lineTo(posX, context.canvas.height);
                context.strokeStyle = colors.border;
                context.stroke();
            }

            for (let y = 0; y <= numOfTiles.y; y++) {
                const posY = y * tileSize;
                context.beginPath();
                context.moveTo(0, posY);
                context.lineTo(context.canvas.width, posY);
                context.strokeStyle = colors.border;
                context.stroke();
            }

            // Apple
            if (gameState.apple) {
                context.beginPath();
                context.fillStyle = colors.apple;
                context.arc(
                    gameState.apple[0] * tileSize + tileSize / 2,
                    gameState.apple[1] * tileSize + tileSize / 2,
                    tileSize / 2,
                    0,
                    2 * Math.PI
                );
                context.fill();
            }

            // Snake
            const snake = gameState.snakeInProgress ?? gameState.snake;

            snake &&
                snake.forEach(([x, y]: Position, index: number) => {
                    if (snake) {
                        context.fillStyle =
                            snake.length <= colors.snake.length
                                ? colors.snake[index]
                                : colors.snake[
                                      Math.floor(
                                          (colors.snake.length * index) /
                                              snake.length
                                      )
                                  ];

                        context.fillRect(
                            x * tileSize,
                            y * tileSize,
                            tileSize,
                            tileSize
                        );
                    }
                });
        },
        [
            colors.apple,
            colors.border,
            colors.snake,
            colors.tile,
            gameState.apple,
            gameState.snake,
            gameState.snakeInProgress,
            numOfTiles.x,
            numOfTiles.y,
            tileSize,
        ]
    );

    const clearCanvas = useCallback((context: CanvasRenderingContext2D) => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }, []);

    useEffect(() => {
        if (tileSize && numOfTiles.x && numOfTiles.y) {
            const currCanvas = canvasRef.current;
            const context = currCanvas?.getContext("2d");
            context && drawCanvas(context);

            return () => {
                context && clearCanvas(context);
            };
        }

        return;
    }, [
        canvasRef,
        drawCanvas,
        clearCanvas,
        tileSize,
        numOfTiles.x,
        numOfTiles.y,
    ]);

    const countRef = useRef<number>(0);

    useAnimationFrame((deltaTime) => {
        countRef.current += currSpeed / deltaTime;

        if (countRef.current < 10) {
            if (smoothAnimations) {
                setGameState((prevGameState) => {
                    const { snake, direction } = prevGameState;

                    if (snake && direction) {
                        const nextGameState: GameState = { ...prevGameState };

                        const progress = countRef.current / 10;
                        const snakeClone: Snake = JSON.parse(
                            JSON.stringify(snake)
                        );

                        if (progress > 0.5) {
                            if (
                                checkIfWillCollideWithWall(snake[0], direction)
                            ) {
                                nextGameState.started = false;
                                return nextGameState;
                            }
                        }

                        snakeClone.forEach((value, index) => {
                            if (index === 0) {
                                snakeClone[index] = [
                                    value[0] + direction[0] * progress,
                                    value[1] + direction[1] * progress,
                                ];
                            } else {
                                const diffX: number =
                                    (snake[index - 1][0] - value[0]) * progress;
                                const diffY: number =
                                    (snake[index - 1][1] - value[1]) * progress;

                                snakeClone[index] = [
                                    value[0] + diffX,
                                    value[1] + diffY,
                                ];
                            }
                        });

                        return {
                            ...prevGameState,
                            snakeInProgress: snakeClone,
                        };
                    }
                    return prevGameState;
                });
            }
            return;
        }

        countRef.current = 0;

        setGameState((prevGameState) => {
            const { snake, apple, direction } = prevGameState;

            if (snake && apple && direction) {
                const nextGameState: GameState = { ...prevGameState };

                const snakeClone = JSON.parse(JSON.stringify(snake));
                const newSnakeHead = [
                    snakeClone[0][0] + direction[0],
                    snakeClone[0][1] + direction[1],
                ];

                if (!smoothAnimations) {
                    if (checkIfWillCollideWithWall(snake[0], direction)) {
                        nextGameState.started = false;
                        return nextGameState;
                    }
                }

                // Check collision with self
                for (const part of snake) {
                    if (
                        newSnakeHead[0] === part[0] &&
                        newSnakeHead[1] === part[1]
                    ) {
                        nextGameState.started = false;
                        return nextGameState;
                    }
                }

                snakeClone.unshift(newSnakeHead);

                // Check if collides with apple
                if (
                    newSnakeHead[0] === apple[0] &&
                    newSnakeHead[1] === apple[1]
                ) {
                    nextGameState.apple = generateRandomApple(snakeClone);
                } else {
                    snakeClone.pop();
                }

                nextGameState.snake = snakeClone;
                nextGameState.snakeInProgress = undefined;

                return nextGameState;
            }

            return prevGameState;
        });
    }, gameState.started);

    const resetGame = useCallback(
        (startGame: boolean = true) => {
            const initialSnakePosition = generateRandomSnake();
            const initialDirection = generateRandomDirection(
                initialSnakePosition
            );
            setGameState({
                started: startGame,
                snake: initialSnakePosition,
                apple: generateRandomApple(initialSnakePosition),
                direction: initialDirection,
            });
        },
        [generateRandomApple, generateRandomDirection, generateRandomSnake]
    );

    const moveSnake = useCallback(
        (e: KeyboardEvent<HTMLCanvasElement>) => {
            const key = e.key;
            e.preventDefault();
            if (KEY_TO_DIRECTION_MAPPINGS.hasOwnProperty(key)) {
                setGameState((prevGameState) => {
                    const prevDirection = prevGameState.direction;
                    const nextDirection = KEY_TO_DIRECTION_MAPPINGS[key];

                    if (
                        prevDirection &&
                        nextDirection &&
                        prevDirection[0] === nextDirection[0] &&
                        prevDirection[1] === nextDirection[1]
                    ) {
                        setCurrSpeed(multiplier * speed);
                    }

                    // ignore if same direction or same axis (cannot go backwards)
                    return prevDirection === nextDirection ||
                        (prevDirection &&
                            prevDirection[0] === 0 &&
                            nextDirection &&
                            nextDirection[0] === 0) ||
                        (prevDirection &&
                            prevDirection[1] === 0 &&
                            nextDirection &&
                            nextDirection[1] === 0)
                        ? prevGameState
                        : {
                              ...prevGameState,
                              direction: KEY_TO_DIRECTION_MAPPINGS[key],
                          };
                });
            }
        },
        [multiplier, speed]
    );

    const handleKeyUp = useCallback(
        (e: KeyboardEvent<HTMLCanvasElement>) => {
            e.preventDefault();
            setCurrSpeed(speed);
        },
        [speed]
    );

    useEffect(() => {
        if (tileSize && numOfTiles) resetGame(false);
    }, [tileSize, numOfTiles, resetGame]);

    const [props, setProps] = useState({
        role: "button",
        tabIndex: 0,
        onKeyDown: moveSnake,
        onKeyUp: handleKeyUp,
        width: tileSize * numOfTiles.x,
        height: tileSize * numOfTiles.y,
    });

    useEffect(() => {
        setProps({
            role: "button",
            tabIndex: 0,
            onKeyDown: moveSnake,
            onKeyUp: handleKeyUp,
            width: tileSize * numOfTiles.x,
            height: tileSize * numOfTiles.y,
        });
    }, [handleKeyUp, moveSnake, numOfTiles.x, numOfTiles.y, tileSize]);

    return {
        props,
        state: gameState,
        methods: {
            resetGame,
            drawCanvas,
            clearCanvas,
        },
    };
};
