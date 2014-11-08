// Generated by CoffeeScript 1.8.0

/*
bundle_logger
------------
Provides gulp style logs to the bundle method in browserify.js
 */

(function() {
  var gutil, prettyHrtime, startTime;

  gutil = require('gulp-util');

  prettyHrtime = require('pretty-hrtime');

  startTime = null;

  module.exports = {
    start: function() {
      startTime = process.hrtime();
      return gutil.log("Running " + (gutil.colors.green("'bundle'")) + "...");
    },
    end: function() {
      var prettyTime, taskTime;
      taskTime = process.hrtime(startTime);
      prettyTime = prettyHrtime(taskTime);
      return gutil.log("Finished " + (gutil.colors.green("'bundle'")) + " in " + (gutil.colors.magenta(prettyTime)));
    }
  };

}).call(this);