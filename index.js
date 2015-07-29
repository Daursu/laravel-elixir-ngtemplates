var gulp = require('gulp');
var Elixir = require('laravel-elixir');
var extend = require('extend');
var htmlmin = require('gulp-htmlmin');
var templateCache = require('gulp-angular-templatecache');

var $ = Elixir.Plugins;
var config = Elixir.config;

var defaults = {
	sourceFolder: 'templates',
	destinationFolder: 'public/js',
	destinationFilename: 'templates.js'
};

/*
 |----------------------------------------------------------------
 | JavaScript File Concatenation
 |----------------------------------------------------------------
 |
 | This task will concatenate and minify your JavaScript files
 | in order. This provides a quick and simple way to reduce
 | the number of HTTP requests your application executes.
 |
 */

Elixir.extend('ngTemplateCache', function(src, output, baseDir, options) {

	options = extend(true, {
		templateCache: {
			standalone: true
		},
		htmlmin: {
			collapseWhitespace: true,
			removeComments: true
		}
	}, options);

	// Override the default output filename
	if (options.templateCache.filename)
		defaults.destinationFilename = options.templateCache.filename;


    var paths = prepGulpPaths(src, baseDir, output);

    new Elixir.Task('ngTemplateCache', function() {
        return gulpTask.call(this, paths, options);
    })
    .watch(paths.src.path)
    .ignore(paths.output.path);
});

/**
 * Trigger the Gulp task logic.
 *
 * @param {object}      paths
 * @param {object|null} babel
 */
var gulpTask = function(paths, options) {
    this.log(paths.src, paths.output);

    return (
        gulp
        .src(paths.src.path)
        .pipe($.if(config.sourcemaps, $.sourcemaps.init()))
	.pipe($.if(config.production, htmlmin(options.htmlmin)))
	.pipe(templateCache(options.templateCache))
        .pipe($.if(config.sourcemaps, $.sourcemaps.write('.')))
        .pipe(gulp.dest(paths.output.baseDir))
        .pipe(new Elixir.Notification('Angular templatecache generated!'))
    );
};


/**
 * Prep the Gulp src and output paths.
 *
 * @param {string|array} src
 * @param {string|null}  baseDir
 * @param {string|null}  output
 */
var prepGulpPaths = function(src, baseDir, output) {
    return new Elixir.GulpPaths()
        .src(src, baseDir || defaults.sourceFolder)
        .output(output || defaults.destinationFolder, defaults.destinationFilename);
};

