/* eslint-disable no-undef */

const sinon = require('sinon');

global.sandbox = sinon.createSandbox();

afterEach(() => {
  global.sandbox.restore();
});
