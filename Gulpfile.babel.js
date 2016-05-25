const projectname = '3d-playground';
const templatePath = '';
const scssPath = `${templatePath}scss/**/*.scss`;
const es2015Path = `${templatePath}es2015/`;
const stylesPath = `${templatePath}styles/`;
const scriptsPath = `${templatePath}scripts/`;
const gulp = require('gulp');
const sass = require('gulp-sass');
const watch = require('gulp-watch');
const autoprefixer = require('gulp-autoprefixer');
const rollup = require('gulp-rollup');
const babel = require('rollup-plugin-babel');
const livereload = require('gulp-livereload');
const nodeResolve = require('rollup-plugin-node-resolve');
const browserify = require('browserify');
const rollupify = require('rollupify');
const babelify = require('babelify');
const watchify = require('watchify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gutil = require('gulp-util');
//const commonjs = require('rollup-plugin-commonjs');

// add custom browserify options here
const customOpts = {
  entries: [`${es2015Path}main.js`],
  debug: true,
};
const opts = Object.assign({}, watchify.args, customOpts);
const b = watchify(browserify(opts).transform('rollupify', {
  config: {
    plugins: [
      nodeResolve({
        jsnext: true,
        //main: true, //for commonJS modules
        extensions: ['.js', '.json'],
        preferBuiltins: false,
      }),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: ['es2015-loose-rollup'],
      }),
    ],
  },
}));

function bundle() {
  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('main.js'))
    // optional, remove if you don't need to buffer file contents
    //.pipe(buffer())
    .pipe(gulp.dest(scriptsPath))
    .pipe(livereload());
}

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal


//Put all css/scss tasks here
gulp.task('css', () => {
  return gulp.src(scssPath)
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 3 version', 'ie 9'],
      cascade: true,
    }))
    .pipe(gulp.dest(stylesPath))
    .pipe(livereload());
});

//Put all javascript tasks here
/*
gulp.task('js', () => {
  gulp.src(`${es2015Path}main.js`, {
    read: false,
  })
  .pipe(rollup({
    plugins: [
      nodeResolve({
        jsnext: true,
        //main: true, //for commonJS modules
        extensions: ['.js', '.json'],
        preferBuiltins: false,
      }),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: ['es2015-loose-rollup'],
      }),
    ],
  })

  .on('error', console.log)
  )
  .pipe(gulp.dest(scriptsPath))
  .pipe(livereload());
});
*/

gulp.task('reload', () => {
  console.log('obj');
  gulp.src(['./**/*.html', './**/*.php', '!node_modules/**/*.*'], {
    read: false,
  })
  .pipe(livereload());
});

//default task
gulp.task('default', ['css', 'js'], () => {
  livereload.listen();
  gulp.watch(scssPath, ['css']);
  gulp.watch(`${es2015Path}/**/*.js`, ['js']);
  gulp.watch('**/*.html', ['reload']);
  gulp.watch('**/*.php', ['reload']);
});
