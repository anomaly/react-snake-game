module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
        "import",
        "jsx-a11y",
        "react",
        "react-hooks",
        "unicorn",
    ],
    extends: [
        "react-app",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended",
    ],
    settings: {
        react: {
            version: "detect",
        },
    },
};
