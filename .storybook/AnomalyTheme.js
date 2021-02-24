import { create } from "@storybook/theming";
import logo from "./anomaly-logo.svg";

export default create({
    base: "light",
    colorPrimary: "#000000",
    colorSecondary: "#E10909",
    brandTitle: "Anomaly",
    brandUrl: "https://www.anomaly.net.au",
    brandImage: logo,

    appBg: "#F9F9F9",
});

