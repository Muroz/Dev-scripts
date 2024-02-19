const { json, packageJson, lines, install } = require("mrm-core");

const husky = require("husky");

module.exports = function task() {
  // Define packages to install.
  const packages = [
    "eslint",
    "eslint-config-airbnb",
    "prettier",
    "eslint-config-prettier",
    "eslint-plugin-prettier",
    "eslint-plugin-json",
  ];

  // Add node modules to the respective ignore files
  lines(".eslintignore").add(["node_modules/"]).save();
  lines(".prettierignore").add(["node_modules/"]).save();

  // Create or load package.json
  const pkg = packageJson();

  pkg
    // Set linting script
    .setScript("lint", "eslint . --cache --fix --cache-location './node_modules/@eslint/.eslintcache/'")
    // Set pretest script
    .prependScript("pretest", "npm run lint")
    // Add lint-staged configuration
    .merge({
      "lint-staged": {
        "*": "npm run lint",
      },
    })
    // Save changes to package.json
    .save();

  // Fetch the base config for eslint
  const eslintrcBase = json("formatting/.eslintrcBase", {}).get();
  // Fetch the base config for prettier
  const prettierBase = json("formatting/.prettierrcBase", {}).get();

  // Create or load .eslintrc
  json(".eslintrc").merge(eslintrcBase).save();
  // Create or load .prettierrc
  json(".prettierrc").merge(prettierBase).save();

  // Install the packages
  install(packages);

  // Run the husky installation script
  husky.install();

  // Get the current pre-commit configuration
  const precommitConfig = lines(".husky/pre-commit", []).get();

  // Check if lint staged is already configured
  const isConfigured = precommitConfig.filter((line) => line.includes("lint-staged")).length > 0;

  if (!isConfigured) {
    // Update the pre-commit configuration
    husky.add(".husky/pre-commit", "npx lint-staged");
  }
};
