module.exports = function (host) {
  return this.livereloadScript ? this.livereloadScript.split('?').join('?host=localhost&') : '';
}