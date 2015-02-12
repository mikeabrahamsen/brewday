var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var karma = require('karma').server;

// use default task to launch BrowserSync and watch JS files
gulp.task('default', ['browser-sync', 'sass', 'tdd'], function () {
    gulp.watch("sass/*.scss", ['sass']);
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        },
        files: ["index.html", "css/*.css", "app/**/*.js", "app/**/*.html"]
    });
});

gulp.task('sass', function(){
    return gulp.src('./sass/styles.scss').pipe(sass(
                { style: 'expanded',
                    includePaths: [
                        './sass',
                        './bower_components/bootstrap-sass-official/assets/stylesheets',
                    ]
                }))
    .pipe(gulp.dest('./css'));
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('tdd', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done);
});
