const gulp = require('gulp');
const webpack = require('webpack');
const eslint = require('gulp-eslint');
const webpackConfig = require('./webpack.config');
const gutil = require('gulp-util');
const execSync = require('child_process').execSync;
const runSequence = require('run-sequence');
const del = require('del');
const path = require('path');
const packager = require('electron-packager');
const fs = require('fs-extra');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');

const packageJSON = require('./package.json');

const files = ['index.html', 'renderer.js', 'main.js', 'dist/bundle.js', 'dist/bundle.css', 'package.json'];
const destPackage = path.join(__dirname, 'tmp');

const options = {
  arch: 'x64',
  dir: destPackage,
  platform: ['win32', 'darwin'],
  'app-version': packageJSON.version,
  'build-version': packageJSON.version,
  icon: path.join(__dirname, 'static', 'images', 'icon.icns'),
  ignore: /(node_modules_dev|bin|patches)/,
  name: 'My Electron App',
  out: path.join(__dirname, 'releases'),
  version: '1.3.4'
};

gulp.task('styles', (done) => {
  gulp.src(['styles/**/*.scss', 'styles/**/*.css'])
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('./tmp'))
    .pipe(concat('bundle.css'))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./dist'))
    .on('finish', () => done());
});

const webpackRun = (config, cb) => {
  webpack(config, (err, stats) => {
    if (err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({
      colors: true,
    }));
    cb();
  });
};

gulp.task('webpack', (cb) => {
  webpackRun(webpackConfig, () => cb());
});

gulp.task('webpack:release', (cb) => {
  webpackConfig.plugins = [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ];
  webpackRun(webpackConfig, () => cb());
});

gulp.task('copy', () => {
  del(destPackage)
    .then(() => {
      execSync(`cd ${__dirname} | mkdir ${destPackage}`);
      files.forEach(f => fs.copySync(path.join(__dirname, f), path.join(destPackage, f)));
    });
});

gulp.task('package', () => {
  del.sync([path.join(__dirname, 'releases')]);
  packager(options, (err, appPaths) => {
    if (err) return console.error(err);
    console.log('done!');
    console.log(appPaths);
  });
});

gulp.task('lint', () => {
  gulp.src(['src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('electron', () => {
  execSync('electron .');
});

gulp.task('delDist', () => {
  del('./dist/');
});


gulp.task('default', (done) => {
  runSequence('delDist', 'lint', 'webpack', 'styles', 'electron', done);
});

gulp.task('release', (done) => {
  runSequence('delDist', 'lint', 'webpack:release', 'styles', 'copy', 'package', done);
});
