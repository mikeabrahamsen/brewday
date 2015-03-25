// Karma configuration
// Generated on Thu Feb 12 2015 13:51:15 GMT-0700 (MST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/restangular/dist/restangular.js',
      'bower_components/lodash/dist/lodash.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/angular-local-storage/angular-local-storage.js',
      'bower_components/angular-ui-select/dist/select.js',
      'bower_components/angular-sanitize/angular-sanitize.min.js',
      'bower_components/angular-bootstrap/ui-bootstrap.min.js',
      'app/**/*.js',
      'app/**/*.html'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'app/**/!(*spec).js': ['coverage'],
        "app/**/*.html": ["ng-html2js"]
    },
    ngHtml2JsPreprocessor: {
        moduleName: "brewday.templates"
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage', 'notify'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
