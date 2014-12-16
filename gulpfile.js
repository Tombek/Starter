/**
 * Require
 */

var gulp                = require('gulp');

// Tools
var plumber             = require('gulp-plumber');
var watch               = require('gulp-watch');
var bs                  = require('browser-sync');
var gutil               = require('gulp-util');
var concat              = require('gulp-concat');
var rename              = require('gulp-rename');

// JS
var browserify          = require('browserify');
var transform           = require('vinyl-transform');
var uglify              = require('gulp-uglify');

// CSS
var sass                = require('gulp-sass');
var autoprefixer        = require('gulp-autoprefixer');
var cmq                 = require('gulp-combine-media-queries');
var stylestats          = require('gulp-stylestats');
var cssshrink           = require('gulp-cssshrink');

// Images
var imagemin            = require('gulp-imagemin');
var svgmin              = require('gulp-svgmin');

/**
 * Config
 */

var config = { dist: false };
gulp.task('set-dist', function() { config.dist = true; });

// Error handling with plumber
var onError = function (err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
};

/**
 * Server
 */

// Start server for browser reloading
gulp.task('bs-server', function() { bs({ proxy: 'localhost:8888' }); });

// Reload all Browsers
gulp.task('bs-reload', function () { bs.reload(); });

/**
 * SCSS/CSS
 */

gulp.task('scss', function() {
  return gulp.src('app/scss/app.scss')
    // Launch plumber if not in dist mode
    .pipe(config.dist ? gutil.noop() : plumber())
    // Compile Sass files using libsass
    .pipe(sass())
    // Autoprefix all css files obtained
    .pipe(autoprefixer('last 2 versions', '> 1%', 'Firefox ESR', 'Opera 12.1', 'ie 8'))
    // CSS Shrink all the things if in dist mode
    .pipe(config.dist ? cssshrink() : gutil.noop())
    // Output them in CSS directory
    .pipe(gulp.dest('app/css'));
});
gulp.task('css', ['scss'], function(){
  gulp.src(['app/vendor/normalize.css/normalize.css', 'app/css/app.css'])
    // Concat all files
    .pipe(config.dist ? concat('app.min.css') : concat('app.css'))
    // Concat all media queries if in dist mode (you might need to remove that pipe in some use case)
    .pipe(config.dist ? cmq() : gutil.noop())
    // CSS Shrink all the things if in dist mode
    .pipe(config.dist ? cssshrink() : gutil.noop())
    // Output it in CSS directory
    .pipe(gulp.dest('app/css'))
    // Reload browser if not in dist mode
    .pipe(config.dist ? gutil.noop() : bs.reload({ stream: true }))
    // Output stylestats if in dist mode
    .pipe(config.dist ? stylestats() : gutil.noop());
});

/**
 * Javascript
 */

gulp.task('browserify', function () {
  var browserified = transform(function(filename) {
    var b = browserify(filename);
    return b.bundle();
  });

  return gulp.src(['./app/js/bundle.js'])
    .pipe(browserified)
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./app/js'));
});

/**
 * Images/SVG
 */

// Optmize image (jpg, png)
gulp.task('img-min', function () {
  return gulp.src(['app/img/**/*.jpg', 'app/img/**/*.png'])
    .pipe(imagemin())
    .pipe(gulp.dest('app/img'));
});

// Minify svg

gulp.task('svg-min', function () {
  return gulp.src('app/img/**/*.svg')
    .pipe(svgmin())
    .pipe(gulp.dest('app/img'));
});

gulp.task('img', ['img-min', 'svg-min']);

/**
 * Watch
 */

gulp.task('watch', ['default', 'bs-server'], function() {
  gulp.watch('app/scss/**/*.scss', ['css']);
  gulp.watch(['app/js/**/*.js', '!app/js/bundle.min.js'], ['browserify']);
  gulp.watch([
    '**/*.php',
    '**/*html',
    'app/js/bundle.min.js'
  ], ['bs-reload']);
});

/**
 * Global tasks
 */
gulp.task('default', ['css', 'browserify']);
gulp.task('dist', ['set-dist', 'default', 'img']);