const gulp = require('gulp')
const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')
const nodemon = require('gulp-nodemon')
const YAML_FILES = ['src/swagger/*.yaml']

gulp.task('ts', ['yaml'], () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"))
})

gulp.task('yaml', () => {
    return gulp.src(YAML_FILES)
        .pipe(gulp.dest('dist/src/swagger'))
})

gulp.task('watch', ['ts', 'serve'], () => {
    gulp.watch(['*.ts', './config/*.ts', './src/**/*.ts', 'src/swagger/*.yaml'], ['ts'])
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