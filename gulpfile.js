const { src, dest, watch, series, parallel } = require('gulp');

const sass = require('gulp-sass');
sass.compiler = require('node-sass');

const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const { notify } = require('browser-sync');

const browserSync = require('browser-sync').create();

const concatJS = require('gulp-concat');
const minifyJS = require('gulp-uglifyjs');

const concatCSS = require('gulp-concat-css');
const minifyCSS = require('gulp-cssnano');

const rigger = require('gulp-rigger');

const sassGLOB = './app/sass/**/*.+(sass|scss)';
const riggerGlob = './app/tpl/**/*.html'

const rename = require('gulp-rename');
const clean = require('gulp-clean');

function SASS(cb) {
    src(sassGLOB)
        .pipe( sourcemaps.init() )
        .pipe( sass({outputStyle: 'compact'}).on('error', sass.logError) )
        .pipe( autoprefixer(['last 15 version', '> 1%', 'ie 8', 'ie 7']) )
        .pipe( sourcemaps.write() )
        .pipe( dest('./app/css') )
        .pipe( browserSync.stream() );

    if (typeof cb == 'function') cb();

}

function liveReload(cb) {
    browserSync.init({
        server: {
            baseDir: './app/'
        },
        notify: false
    });

    watch(['./app/**/*.html', './app/js/**/*.js']).on('all', browserSync.reload);
    watch([sassGLOB]).on('all', () => SASS());
    watch([riggerGlob]).on('all', () => riggerIt());

    if (typeof cb == 'function') cb();
}

function bundleCss(cb) {
    src([
        './node_modules/slick-carousel/slick/slick.css',
        './node_modules/@fancyapps/fancybox/dist/jquery.fancybox.css'
    ]).pipe( concatCSS( 'libs.min.css' ) )
      .pipe( minifyCSS() )
      .pipe( dest('./app/css') );
    
      if (typeof cb == 'function') cb();
}


function bundleJs(cb) {
    src([
        './node_modules/jquery/dist/jquery.js',
        './node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
        './node_modules/slick-carousel/slick/slick.js'
    ]).pipe( concatJS( 'libs.min.js' ) )
      .pipe( minifyJS() )
      .pipe( dest('./app/js') );
    
      if (typeof cb == 'function') cb();
}


function riggerIt(cb) {
    src('./app/tpl/*.html')
        .pipe( rigger() )
        .pipe( dest('./app') );

    if (typeof cb == 'function') cb();
}


function processImg(cb) {
    src('./app/img/*-min.*')
        .pipe( rename( function( opt, file ) {
            opt.basename = opt.basename.slice(0, -4);
            src(file.history[0], {read: false}).pipe( clean() );
            return opt;
        }) )
        .pipe( dest('./app/img') );

    if (typeof cb == 'function') cb();
}


// exports.sass = SASS;
exports.watch = series(SASS, liveReload);
exports.bundleAll = parallel(bundleCss, bundleJs)

// exports.bundleCSS = bundleCss;
// exports.bundleJS = bundleJs;

exports.processImg = processImg;