function prodOnly(mode) {
    return process.env.NODE_ENV === "production" ? mode : "off";
}

module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ["plugin:vue/essential", "@vue/prettier", "@vue/typescript"],
    rules: {
        "no-console": prodOnly("error"),
        "no-debugger": prodOnly("error")
    },
    parserOptions: {
        parser: "@typescript-eslint/parser"
    }
};
