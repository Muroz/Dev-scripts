module.exports.parameters = {
  eslintPreset: {
    type: "input",
    message: "ESLint preset to use as basis",
    validate(value) {
      return value ? true : "eslintPreset is required";
    },
  },
};
