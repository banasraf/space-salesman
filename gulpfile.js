var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var paths = {
    pages: ['*.html']
};

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task("copy-image", function () {
    return gulp.src(['img/*']).pipe(gulp.dest("dist/img"));
});

gulp.task('copy-css', function () {
    return gulp.src(['css/*']).pipe(gulp.dest("dist/css"));
});

gulp.task("default",
    gulp.series(gulp.parallel('copy-html'),
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
        .pipe(gulp.dest("dist/script"));
}));