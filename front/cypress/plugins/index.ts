/**
 * @type {Cypress.PluginConfig}
 */
// '@cypress/code-coverage/task' is a CommonJS module (module.exports = fn):
// `import * as` would give a namespace object instead of the function.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const registerCodeCoverageTasks = require('@cypress/code-coverage/task');

export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  return registerCodeCoverageTasks(on, config);
};
