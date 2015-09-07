var gulp = require("gulp");
var tsConfig = require('gulp-tsconfig-update');

gulp.task('jsConfig', function() {
  return gulp.src("./src/**/*.js")
    .pipe(tsConfig({configFile: "./jsconfig.json"}));
});
