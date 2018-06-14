var path = {
    build: { // Путь до релиза
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { // Путь до исходников
        html: 'src/*.html', 
        js: 'src/js/main.js',
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: { // Что отслеживаем
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

var config = { // Настройка сервера
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend Project"
};

// Подключение плагинов
var gulp          = require('gulp'),
    sass          = require('gulp-sass'),
    notify        = require('gulp-notify'),
    autoprefixer  = require('gulp-autoprefixer'),
    rigger        = require('gulp-rigger'),
    uglify        = require('gulp-uglify'),
    sourcemaps    = require('gulp-sourcemaps'),
    rename        = require('gulp-rename'),
    cssnano       = require('gulp-cssnano'),
    pngquant      = require('gulp-pngquant'),
    imagemin      = require('gulp-imagemin'),
    watch         = require('gulp-watch'),
    rimraf        = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

    // Таски    
    gulp.task('html:build', function () { // Собираем HTML
        gulp.src(path.src.html) 
            .pipe(rigger()) 
            .pipe(gulp.dest(path.build.html)) 
            .pipe(reload({stream: true}));
    });

    gulp.task('js:build', function () {// Собираем JavaScript
        gulp.src(path.src.js) 
            .pipe(rigger()) 
            .pipe(sourcemaps.init()) 
            .pipe(uglify()) 
            .pipe(sourcemaps.write()) 
            .pipe(rename({'suffix':'.min'}))
            .pipe(gulp.dest(path.build.js)) 
            .pipe(reload({stream: true}));
    });

    gulp.task('style:build', function () { // Собираем SASS
        gulp.src(path.src.style) 
            .pipe(sourcemaps.init()) 
            .pipe(sass()).on('error',notify.onError(function(error){
                return '\n' + 'PLUG: ' + error.plugin  + '\n' + 'FILE: ' + error.file + 
                           '\n' + 'LINE: ' + error.line + '\n' + 'PROB: ' +error.message 
            }))
            .pipe(autoprefixer(['last 15 versions','> 1%','ie 8']))
            .pipe(cssnano()) 
            .pipe(sourcemaps.write())
            .pipe(rename({'suffix':'.min'}))
            .pipe(gulp.dest(path.build.css)) 
            .pipe(reload({stream: true}));
    });

    gulp.task('image:build', function () { // Собираем изображения
        gulp.src(path.src.img)
            .pipe(imagemin({ 
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()],
                interlaced: true
            }))
            .pipe(gulp.dest(path.build.img)) 
            .pipe(reload({stream: true}));
    });

    gulp.task('fonts:build', function() { // Перекидываем шрифты
        gulp.src(path.src.fonts)
            .pipe(gulp.dest(path.build.fonts))
    });

    gulp.task('build', [   // Полная сборка проекта
        'html:build',
        'js:build',
        'style:build',
        'fonts:build',
        'image:build'
    ]);

    gulp.task('webserver', function () {   // Запуск сервера
        browserSync(config);
    });

    gulp.task('watch', function(){  // Слежения за изменениями в файла
        watch([path.watch.html], function(event, cb) {
            gulp.start('html:build');
        });
        watch([path.watch.style], function(event, cb) {
            gulp.start('style:build');
        });
        watch([path.watch.js], function(event, cb) {
            gulp.start('js:build');
        });
        watch([path.watch.img], function(event, cb) {
            gulp.start('image:build');
        });
        watch([path.watch.fonts], function(event, cb) {
            gulp.start('fonts:build');
        });
    });

    gulp.task('clean', function (cb) { // Очистка релизной папки
        rimraf(path.clean, cb);
    });

    gulp.task('default', ['build', 'webserver', 'watch']); // Запуск всего для работы