const path = require('path');
const gulp = require('gulp');
// const pug = require('gulp-pug');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const terser = require('gulp-uglify-es').default;
const webpackStream = require('webpack-stream');
const browser = require('browser-sync').create();
const historyApi = require('connect-history-api-fallback');
require('dotenv').config();

gulp.task('bundleJSDev', () =>
  gulp
    .src('src/js/app.js', { sourcemaps: true })
    .pipe(
      webpackStream({
        mode: 'development',
        output: {
          filename: 'app.bundle.js',
        },
        devtool: 'inline-source-map',
        node: {
          fs: 'empty',
        },
        plugins: [
          new webpackStream.webpack.EnvironmentPlugin([
            'FIREBASE_API_KEY',
            'FIREBASE_AUTH_DOMAIN',
            'FIREBASE_PROJECT_ID',
            'FIREBASE_DB_URL',
            'FIREBASE_STORAGE_BUCKET',
          ]),
        ],
      })
    )
    .pipe(gulp.dest('public/js/'))
    .pipe(browser.stream())
);

gulp.task('bundleJS', () =>
  gulp
    .src('src/js/app.js')
    .pipe(
      webpackStream({
        mode: 'production',
        output: {
          filename: 'app.bundle.js',
        },
        node: {
          fs: 'empty',
        },
        plugins: [
          new webpackStream.webpack.EnvironmentPlugin([
            'FIREBASE_API_KEY',
            'FIREBASE_AUTH_DOMAIN',
            'FIREBASE_PROJECT_ID',
            'FIREBASE_DB_URL',
            'FIREBASE_STORAGE_BUCKET',
          ]),
        ],
      })
    )
    .pipe(terser())
    .pipe(gulp.dest('public/js/'))
    .pipe(browser.stream())
);

gulp.task('bundleCSS', () =>
  gulp
    .src('src/scss/style.scss')
    .pipe(
      sass({
        includePaths: [path.join(__dirname, 'node_modules')],
      })
    )
    .pipe(csso())
    .pipe(gulp.dest('public/css/'))
    .pipe(browser.stream())
);

gulp.task('cleanHTML', () =>
  gulp
    .src(['src/views/**/*.html', '!src/views/**/_*.html'])
    .pipe(gulp.dest('public/'))
    .pipe(browser.stream())
);

gulp.task(
  'serve',
  gulp.parallel(['bundleCSS', 'bundleJSDev', 'cleanHTML'], () => {
    browser.init({
      server: {
        baseDir: './public',
        middleware: [historyApi()],
      },
    });

    gulp.watch('src/scss/**/*.scss', gulp.series('bundleCSS'));
    gulp.watch('src/js/**/*.js', gulp.series('bundleJSDev'));
    gulp.watch('src/views/**/*.html', gulp.series('cleanHTML'));
  })
);

gulp.task('default', gulp.series('serve'));
gulp.task('build', gulp.parallel('bundleCSS', 'bundleJS', 'cleanHTML'));
