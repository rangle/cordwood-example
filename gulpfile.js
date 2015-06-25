var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var connect = require('gulp-connect');
var ngHtml2Js = require('gulp-ng-html2js');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(rename('app.css' ))
    .pipe(gulp.dest('./server/branch/master'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('html', function() {
  return gulp.src('./www/templates/**/*.html')
    .pipe(ngHtml2Js({
        moduleName: 'myAppWithCordwood',
        prefix: '/templates'
    }))
    .pipe(concat('app.templ.js'))
    .pipe(gulp.dest('./server/branch/master'));
});

var scripts = [
  './www/lib/ionic/js/ionic.bundle.js',
  './www/js/**/*.js',
  './server/branch/master/app.templ.js'
];

gulp.task('build', ['html', 'sass'], function() {
  return gulp.src(scripts)
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./server/branch/master'));
});

gulp.task('server', function() {
  connect.server({
    root: 'server',
    port: 3000
  });
});


gulp.task('default', ['sass']);