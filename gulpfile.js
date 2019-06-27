var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");

gulp.task("copy-html-game", function () {
    return gulp.src(['game/*.html'])
        .pipe(gulp.dest("dist/game"));
});

gulp.task("copy-html-user", function () {
    return gulp.src(['user/*.html']).pipe(gulp.dest('dist'))
});

gulp.task("copy-image", function () {
    return gulp.src(['img/*']).pipe(gulp.dest("dist/game/img"));
});

gulp.task('copy-css', function () {
    return gulp.src(['css/*']).pipe(gulp.dest("dist/game/css"));
});

gulp.task("default",
    gulp.series(gulp.parallel('copy-html-game'),
        gulp.parallel('copy-html-user'),
        gulp.parallel('copy-image'),
        gulp.parallel('copy-css'),
        function () {
        return browserify({
            basedir: '.',
            debug: true,
            entries: ['typescript/main.ts'],
            cache: {},
            packageCache: {}
            })
            .plugin(tsify)
            .bundle()
            .pipe(source('bundle.js'))
            .pipe(gulp.dest("dist/game/script"));
        },
        function () {
            return browserify({
                basedir: '.',
                debug: true,
                entries: ['typescript/startscreen.ts'],
                cache: {},
                packageCache: {}
            })
                .plugin(tsify)
                .bundle()
                .pipe(source('start.bundle.js'))
                .pipe(gulp.dest("dist/game/script"));
        },
        function () {
            return browserify({
                basedir: '.',
                debug: true,
                entries: ['typescript/cockpit.ts'],
                cache: {},
                packageCache: {}
            })
                .plugin(tsify)
                .bundle()
                .pipe(source('cockpit.bundle.js'))
                .pipe(gulp.dest("dist/game/script"));
        }

));