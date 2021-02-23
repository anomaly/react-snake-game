import React from "react";
import { Meta, Story } from "@storybook/react";
import SnakeGame, { Props } from "../src";

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
