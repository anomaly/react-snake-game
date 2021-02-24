import React from "react";
import * as ReactDOM from "react-dom";
import { SnakeGame } from "../src";

describe("Default", () => {
    it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(<SnakeGame />, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
