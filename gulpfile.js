'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var rimraf = require('rimraf');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// Optimize Images
gulp.task('images', function () {
    return gulp.src('src/images/**/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe(reload({stream: true, once: true}))
        .pipe($.size({title: 'images'}));
});

// Automatically Prefix CSS
gulp.task('styles:css', function () {
    return gulp.src('src/styles/**/*.css')
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('src/styles'))
        .pipe(reload({stream: true}))
        .pipe($.size({title: 'styles:css'}));
});

// Compile Any Other Sass Files You Added (src/styles)
gulp.task('styles:scss', function () {
    return gulp.src(['src/styles/**/*.scss'])
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            loadPath: ['src/styles']
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size({title: 'styles:scss'}));
});

// Output Final CSS Styles
gulp.task('styles', ['styles:scss', 'styles:css']);

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
    return gulp.src('src/**/*.html')
        .pipe($.useref.assets({searchPath: '{.tmp,src}'}))
        // Concatenate And Minify Styles
        .pipe($.if('*.css', $.csso()))
        // Remove Any Unused CSS
        // Note: If not using the Style Guide, you can delete it from
        // the next line to only include styles your project uses.
        .pipe($.if('*.css', $.uncss({ html: ['src/index.html'] })))
        .pipe($.useref.restore())
        .pipe($.useref())
        // Minify Any HTML
        .pipe($.minifyHtml())
        // Output Files
        .pipe(gulp.dest('dist'))
        .pipe($.size({title: 'html'}));
});

// Clean Output Directory
gulp.task('clean', function (cb) {
    rimraf('dist', rimraf.bind({}, '.tmp', cb));
});

// Watch Files For Changes & Reload
gulp.task('serve', function () {
    browserSync.init(null, {
        server: {
            baseDir: ['src', '.tmp']
        },
        // proxy: "localhost:8888",
        notify: false
    });

    gulp.watch(['src/**/*.html'], reload);
    gulp.watch(['src/**/*.php'], reload);
    gulp.watch(['src/styles/**/*.{css,scss}'], ['styles']);
    gulp.watch(['.tmp/styles/**/*.css'], reload);
    gulp.watch(['src/images/**/*'], ['images']);
});

// Build Production Files
gulp.task('build', function (cb) {
    runSequence('styles', ['html', 'images'], cb);
});

// Default Task
gulp.task('default', ['clean'], function (cb) {
    gulp.start('build', cb);
});
