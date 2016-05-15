'use strict';

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const browserSync = require('browser-sync');
const watch = require('gulp-watch');
const browserify = require('browserify');
const sourcemaps = require('gulp-sourcemaps');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const stylus = require('gulp-stylus');
const jeet = require('jeet');
const nib = require('nib');
const del = require('del');
const fs = require('fs');
const express = require('express');
const handlebars = require('handlebars');
const gulpHandlebars = require('gulp-handlebars-html')(handlebars);
const rename = require('gulp-rename');
const locales = require('./locales.json');
const packageData = require('./package.json');
const version = packageData.version;
const port = 3000;

function startExpress(pushPort) {
    const app = express();

    app.use('/', express.static('dist'));

    app.get('*', function (req, res) {
        res.set('content-type', 'text/html');
        res.send(fs.readFileSync('dist/index.html', 'utf8'));
    });

    app.listen(pushPort);
}

function handleBundleErrors() {
    var args = Array.prototype.slice.call(arguments);

	console.log(args);

    notify.onError({
        title: "Bundle error",
        message: "<%= error.message %>"
    }).apply(this, args);

    this.emit('end');
}

function clean() {
    return del([
        '.tmp',
        'dist'
    ]);
}

function bundle() {
    return browserify({
        entries: 'src/js/app.jsx',
        extensions: [
            '.jsx',
            '.js'
        ],
        debug: true
    })
        .transform(babelify, {presets: ["es2016", "react"]})
        .bundle()
        .on('error', handleBundleErrors)
        .pipe(source('app.js'))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
}

function stylusCompile() {
    return gulp.src('src/styl/project.styl')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(stylus({
            use: [
                jeet(),
                nib()
            ]
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
}

function images(){
    return gulp.src('src/img/**/*.**')
        .pipe(gulp.dest('dist/img'));
}

function fonts(){
    return gulp.src('src/fonts/**/*.**')
        .pipe(gulp.dest('dist/fonts'));
}

function baseHtml() {
    let intlLocales = [];

    for (let i = 0, l = locales.length; i < l; i++) {
        intlLocales.push('Intl.~locale.' + locales[i]);
    }

    let templateData = {
		version: version
    };

    let options = {

    };

    return gulp.src('src/index.hbs')
        .pipe(gulpHandlebars(templateData, options))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
}

function translations() {
    return gulp
        .src(['src/translations/*.json'])
        .pipe(gulp.dest('dist/translations'))
        .pipe(browserSync.stream());
}

function browserSyncInit() {
    return browserSync.init({
        ui: {
            port: port
        },
        proxy: 'http://localhost:' + (port + 1)
    });
}

gulp.task('clean', function () {
    return clean();
});

gulp.task('bundle', ['clean'], function () {
    return bundle();
});

gulp.task('stylus', ['bundle'], function () {
    return stylusCompile();
});

gulp.task('fonts', ['stylus'], function () {
    return fonts();
});

gulp.task('images', ['fonts'], function () {
    return images();
});

gulp.task('baseHtml', ['images'], function () {
    return baseHtml();
});

gulp.task('translations', ['baseHtml'], function () {
    return translations();
});

gulp.task('browser-sync', ['translations'], function () {
    browserSyncInit();
});

gulp.task('default', ['browser-sync'], function () {
    startExpress(port + 1);

    gulp.watch([
        './src/ts/**/*.js',
        './src/ts/**/*.jsx'
    ], function () {
        bundle();
    });

    gulp.watch([
        './src/*.hbs'
    ], function () {
        baseHtml();
    });

    gulp.watch([
        './src/img/**/*'
    ], function () {
        images();
    });

    gulp.watch([
        './src/fonts/**/*'
    ], function () {
        fonts();
    });

    gulp.watch([
        './src/styl/**/*.styl'
    ], function () {
        stylusCompile();
    });

    gulp.watch([
        './src/translations/*.json'
    ], function () {
        translations();
    });
});

gulp.task('export-locales', function () {
    exportLocales();
});