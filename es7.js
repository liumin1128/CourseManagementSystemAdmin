// index.js 
// 用于引入babel，并且启动app.js

require("babel-core/register");
var app = require("./app.js");

module.exports = app;
