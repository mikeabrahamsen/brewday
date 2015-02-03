var gulp = require('gulp');
var browserSync = require('browser-sync');

// use default task to launch BrowserSync and watch JS files
gulp.task('default', ['browser-sync'], function () {

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    // gulp.watch("js/*.js", ['js', browserSync.reload]);
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        },
        files: ["css/*.css", "js/**/*.js", "partials/**"]
    });
});
