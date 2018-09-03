const gulp = require('gulp')
const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')
const nodemon = require('gulp-nodemon')
const COPY_YAML = ['src/swagger/*.yaml']
const COPY_FILES = ['package.json']

gulp.task('ts', ['copy-yaml', 'copy-files'], () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"))
})

gulp.task('copy-yaml', () => {
    return gulp.src(COPY_YAML)
        .pipe(gulp.dest('dist/src/swagger'))
})

gulp.task('copy-files', () => {
    return gulp.src(COPY_FILES)
        .pipe(gulp.dest('dist'))
})

gulp.task('serve', ['ts'], () => {
    nodemon({
        script: "dist/server.js",
        env: { "NODE_ENV": "dev" }
    }).on('restart', function () {
        console.log('restarted server!');
    })
})

gulp.task('build', ['ts'])
gulp.task('build:dev', ['watch'])