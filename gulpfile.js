/*------------------------------------*\
    Require
\*------------------------------------*/

var gulp                = require('gulp'),
    // Tools
    plumber             = require('gulp-plumber'),
    watch               = require('gulp-watch'),
    bs                  = require('browser-sync'),
    args                = require('minimist')(process.argv.slice(2)),
    filter              = require('gulp-filter'),
    gutil               = require('gulp-util'),
    runSequence         = require('run-sequence'),
    // Multiple
    concat              = require('gulp-concat'),
    rename              = require('gulp-rename'),
    // JS
    uglify              = require('gulp-uglify'),
    // CSS
    sass                = require('gulp-sass'),
    autoprefixer        = require('gulp-autoprefixer'),
    stylestats          = require('gulp-stylestats'),
    cssshrink           = require('gulp-cssshrink'),
    autoimportscss      = require('./custom-module/autoimportscss'),
    // Images
    imagemin            = require('gulp-imagemin'),
    svgmin              = require('gulp-svgmin');


/*------------------------------------*\
    Path
\*------------------------------------*/

/**
 * Server
 */
var proxy_base = "localhost:8888";

/**
 * Scripts
 */
var script_path = "assets/js/";
var script_path_vendor = script_path + "vendor/";
var script_path_pluginsdir = script_path + "plugins/";

var script_path_main = script_path + "main.js";

/**
 * SCSS
 */
var scss_path = "assets/scss/";
var scss_path_vendor = scss_path + "vendor/";
var scss_path_layout = scss_path + "layout/";

var scss_path_main = scss_path + "main.scss";

/**
 * CSS
 */
var css_path = "assets/css/";

/**
 * Images
 */
var img_path = "assets/img/";

/*------------------------------------*\
    Functions & Variables
\*------------------------------------*/

var ieScssFilter = filter(['*', '!ie.scss']);
var getFolders = function(dir){
    return fs.readdirSync(dir)
        .filter(function(file){
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

/*------------------------------------*\
    Server tasks
\*------------------------------------*/

/**
 * Start server for browser reloading
 */
gulp.task('bs-server', function() {
    bs({ proxy: proxy_base });
});

/**
 * Reload all Browsers
 */
gulp.task('bs-reload', function () {
    bs.reload();
});

/*------------------------------------*\
    SCSS/CSS Tasks
\*------------------------------------*/

/**
 * Automaticaly import scss layout files
 */
gulp.task('autoimportscss', function() {
    return gulp.src(scss_path + "*.scss")
        .pipe(args.dist ? plumber() : gutil.noop())
        // Filter ie.scss from stream
        .pipe(ieScssFilter)
        // Auto import scss layout files in other files
        .pipe(autoimportscss( scss_path_layout + '/*.scss', scss_path ))
        // Output them in Scss directory
        .pipe(gulp.dest(scss_path));
});

gulp.task('scss', function() {
    var d = args.dist;

    return gulp.src(scss_path + "**/*.scss")
        .pipe(d ? plumber() : gutil.noop())
        // Compile Sass files using libsass
        .pipe(sass())
        // Autoprefix all css files obtained
        .pipe(autoprefixer("last 2 versions", "> 1%", "Firefox ESR", "Opera 12.1", "ie 8"))
        // CSS Shrink all the things if in dist mode
        .pipe(d ? cssshrink() : gutil.noop())
        // Output them in CSS directory
        .pipe(gulp.dest(css_path))
        .pipe(d ? gutil.noop() : bs.reload({ stream: true }));
});

// /*------------------------------------*\
//     JS Tasks
// \*------------------------------------*/

/**
 * Concatenate & Minify main js
 */
gulp.task('main-script', function() {
    return gulp.src(script_path_main)
        .pipe(rename({ suffix: ".min" }))
        .pipe(uglify())
        .pipe(gulp.dest(script_path));
});

/**
 * Concatenate & Minify js plugins
 */
gulp.task('plugins-script', function() {
    return gulp.src('assets/js/plugins/*.js')
        .pipe(args.dist ? plumber() : gutil.noop())
        .pipe(concat('plugins.js'))
        .pipe(gulp.dest(script_path))
        .pipe(rename({ suffix: ".min" }))
        .pipe(uglify())
        .pipe(gulp.dest(script_path));
});

/**
 * Concat vendor libs
 */
gulp.task('vendor-script', function() {
    var folders = getFolders(script_path_vendor);

    var tasks = folders.map(function(folder) {
        return gulp.src(path.join(script_path_vendor, folder, '/*.js'))
            .pipe(args.dist ? plumber() : gutil.noop())
            .pipe(concat(folder + '.js'))
            .pipe(uglify())
            .pipe(rename({ suffix: ".min" }))
            .pipe(gulp.dest(script_path_vendor));
    });

    return es.concat.apply(null, tasks);
});

// /*------------------------------------*\
//     Images Tasks
// \*------------------------------------*/

/**
 * Optmize image (jpg, png)
 */
gulp.task('img-min', function () {
    return gulp.src([img_path + '**/*.jpg', img_path + '**/*.png'])
        .pipe(imagemin())
        .pipe(gulp.dest(img_path));
});

/**
 * Minify svg
 */

gulp.task('svg-min', function () {
    return gulp.src(img_path + '**/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest(img_path));
});

// /*------------------------------------*\
//     Watch
// \*------------------------------------*/

gulp.task('default', function() {
    runSequence('autoimportscss', 'scss', 'plugins-script');

    // Distribution
    if(args.dist){
        runSequence(['main-script', 'img-min', 'svg-min']);
    }
    // Development
    else{
        runSequence('bs-server');

        gulp.watch(scss_path + '**/*.scss', ['scss']);
        gulp.watch(script_path_pluginsdir + '*.js', ['plugins-script']);
        gulp.watch([
            '**/*.php',
            script_path + 'main.js',
            script_path + 'plugins.min.js',
        ], ['bs-reload']);
    }
});