import * as React from "react";
import "react-app-polyfill/ie11";
import * as ReactDOM from "react-dom";
import { useSnakeGame } from "../.";
import "./App.css";

const App = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const { props, state, methods } = useSnakeGame(canvasRef, {
        smoothAnimations: false,
        speed: 25,
        multiplier: 3,
        tileSize: 40,
        numOfTiles: { x: 30, y: 20 },
        colors: {
            background: "#ebedf0",
            border: "#fff",
            snake: ["#216e39", "#30a14e", "#40c463", "#9be9a8"],
            apple: "#ea4a5a",
        },
    });

    const handleKeyDown = React.useCallback(
        event => {
            if (event.key === " " && !state.started) {
                canvasRef.current && canvasRef.current.focus();
                methods.resetGame();
            }
        },
        [methods, state.started]
    );

    React.useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <div className="snake-container">
            <div>
                <canvas ref={canvasRef} {...props} />
                <div>Score: {state.snake ? state.snake.length : 0}</div>
            </div>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById("root"));
