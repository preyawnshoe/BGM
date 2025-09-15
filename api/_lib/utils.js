const { nanoid } = require('nanoid');

function generateId(length = 8) {
  return nanoid(length);
}

module.exports = { generateId };