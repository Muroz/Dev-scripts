// Import utility helpers (could use any npm package here)
const {
  // JSON files
  json,
  // package.json
  packageJson,
  // New line separated text files
  lines,
  // Install npm packages
  install,
} = require("mrm-core");
const husky = require("husky");

// task() function gets task parameters object as the first argument
// (see `module.exports.parameters` at the end of the file)
// module.exports = function task({ eslintPreset }) {
module.exports = function task() {
  // Define packages to install.
  const packages = ["eslint"];

  // Append custom eslint-config in case it"s defined
  // if (eslintPreset !== "eslint:recommended") {
  //   packages.push(`eslint-config-${eslintPreset}`);
  // }
  packages.push("eslint-config-airbnb");
  // packages.push("eslint-config-airbnb-typescript")
  // packages.push("@typescript-eslint/eslint-plugin@^6.0.0")
  // packages.push("@typescript-eslint/parser@^6.0.0")
  packages.push("prettier");
  packages.push("eslint-config-prettier");
  packages.push("eslint-plugin-prettier");

  // Create or load .eslintignore, and set basic ignores
  lines(".eslintignore").add(["node_modules/"]).save();

  // Create or load package.json
  const pkg = packageJson();

  pkg
    // Set linting script
    .setScript(
      "lint",
      "eslint . --cache --fix --cache-location './node_modules/@eslint/.eslintcache/"
    )
    // Set pretest script
    .prependScript("pretest", "npm run lint")
    .merge({
      "lint-staged": {
        "*": "npm run lint",
      },
    })
    // Save changes to package.json
    .save();

  // Create or load .eslintrc
  const eslintrc = json(".eslintrc");
  const prettierrc = json(".prettierrc");

  // Use Babel parser if the project depends on Babel
  if (pkg.get("devDependencies.babel-core")) {
    const parser = "babel-eslint";
    packages.push(parser);
    eslintrc.merge({ parser });
  }

  eslintrc.set("extends", ["airbnb", "prettier"]);
  eslintrc.set("plugins", ["prettier"]);
  eslintrc.set("rules.prettier/prettier", ["error"]);

  prettierrc.set("trailingComma", "es5");
  prettierrc.set("singleAttributePerLine", true);
  prettierrc.set("printWidth", 100);

  // eslintrc.set("extends", "airbnb-typecript")
  // Configure ESlint preset, if set (defaults to eslint:recommended)
  // if (eslintPreset) {
  //   eslintrc.set("extends", eslintPreset);
  // }

  // Save changes to .eslintrc
  eslintrc.save();
  prettierrc.save();

  // Install new npm dependencies
  install(packages);

  husky.install();
  husky.add(".husky/pre-commit", "npx lint-staged");
};

// Define task configuration (see "Configuration prompts" section below for details)
module.exports.parameters = {
  // Follows Inquirer.js questions format.
  eslintPreset: {
    // input, number, confirm, list, rawlist, expand, checkbox, password, editor
    type: "input",
    message: "ESLint preset to use as basis",
    default: "eslint:recommended",
  },
};

// Description to show in the task list
module.exports.description = "Adds ESLintas";
