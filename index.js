const core = require('@actions/core');

const setup = require('./lib/example');

(async () => {
  try {
    await setup();
  } catch (error) {
    core.setFailed(error.message);
  }
})();
