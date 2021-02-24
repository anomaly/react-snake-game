import React from "react";
import { Meta, Story } from "@storybook/react";
import { SnakeGame, Props } from "../src";

export default {
    title: "Snake Game",
    component: SnakeGame,
    argTypes: {
        tileColor: {
            control: "color",
        },
        borderColor: {
            control: "color",
        },
        snakeColors: { control: "array" },
        appleColor: {
            control: "color",
        },
    },
} as Meta;

const Template: Story<Props> = (args) => <SnakeGame {...args} />;

export const Default = Template.bind({});

Default.args = SnakeGame.defaultProps;

export const SmoothAnimations = Template.bind({});

SmoothAnimations.args = {
    ...Default.args,
    smoothAnimations: true,
};

export const DifferentColors = Template.bind({});

DifferentColors.args = {
    ...Default.args,
    tileColor: "#111827",
    borderColor: "#9CA3AF",
    snakeColors: [
        "#4C1D95",
        "#5B21B6",
        "#6D28D9",
        "#7C3AED",
        "#8B5CF6",
        "#A78BFA",
        "#C4B5FD",
        "#DDD6FE",
        "#EDE9FE",
        "#F5F3FF",
    ],
    appleColor: "#FCD34D",
};
