var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('default', function() {
    // place code for your default task here
});
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});
