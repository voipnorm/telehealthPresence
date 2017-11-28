var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var gulpMocha = require('gulp-mocha');
var eslint =  require('gulp-eslint');
var env = require('gulp-env');

gulp.task('default',['lint','test'], function(){
    nodemon({
        exec: 'DEBUG=flint*,sparky* node',
        script: 'server.js',
        ext: 'js',
        env: {
            PORT: 8080
        },
        ignore: ['./node_modules/']
    })
    .on('restart',['test'], function(){
        console.log('We have restarted');
    })
});

gulp.task('test', function(){
    env({vars:{ENV:'Test'}});
    gulp.src(['Tests/singleFunctionTest.js','Tests/cityUpdateTest.js','Tests/activeUpdateTest.js'/*,'Tests/unitUpdateTest.js'*/])
        .pipe(gulpMocha({reporter: 'nyan'}));
});

gulp.task('lint', function () {
    return gulp.src(['**/*.js','!node_modules/**','!code graveyard/**','!Tests/**'])
        .pipe(eslint())
        .pipe(eslint.format());
});

