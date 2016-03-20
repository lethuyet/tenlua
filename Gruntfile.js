module.exports = function(grunt) {

	"use strict";

	// require('load-grunt-tasks')(grunt);


	/*packages for task: grunt dev =======*/
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browser-sync');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-angular-templates');
	


	/*packages for task: grunt build =======
	
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-ngmin');
	grunt.loadNpmTasks('grunt-usemin');
	grunt.loadNpmTasks('grunt-svgmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-rev');
	grunt.loadNpmTasks('grunt-string-replace');
*/

	/*unused packages =====================
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-bower-install');
	grunt.loadNpmTasks('grunt-available-tasks');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	*/


	grunt.initConfig({

		devDir: 'www-dev',
		distDir: 'www',

		// availabletasks: {
		// 	tasks: {
		// 		options: {
		// 			filter: 'include',
		// 			groups: {
		// 				'Development': ['dev',   ],
		// 				'Production': ['package'],
		// 				'Continuous Integration': ['ci']
		// 			},
		// 			sort: ['dev', 'test:unit', 'test:e2e', 'report', 'package', 'ci'],
		// 			descriptions: {
		// 				'dev' : 'Launch the static server and watch tasks',
		// 				'package' : 'Package your web app for distribution',
		// 				'ci' : 'Run unit & e2e tests, package your webapp and generate reports. Use this task for Continuous Integration'
		// 			},
		// 			tasks: ['dev',    'package',  'ci']
		// 		}
		// 	}
		// },
		'bower-install': {
			target: {
				src: '<%= devDir %>/index.html',
				ignorePath: '<%= devDir %>/',
				jsPattern: '<script type="text/javascript" src="{{filePath}}"></script>',
				cssPattern: '<link rel="stylesheet" href="{{filePath}}" >'
			}
		},
		clean: {
			dist: ['.tmp', '<%= distDir %>']
		},
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= devDir %>',
					dest: '<%= distDir %>/',
					src: [
						// 'index.html',
						// 'img/**'
						'sink.html',
						'*.php',
						'*.{ico,png,jpg,gif,txt,xml}',
						'.htaccess',
						'img/{,*/}*.{jpg,jpeg,png,gif,webp,cur}',
						'css/fontface.css',
						'css/fonts/*.{woff,eot,ttf,svg}',
						'js/conditional-resource/**/*',
						'data/**/*',
						'lucky-round/**/*'
					]
				},
				{
					expand: true,
					dot: true,
					cwd: '.tmp/concat/',
					dest: '<%= distDir %>/',
					src: [
						'css/**/*'
					]
				}]
			},
			dist2: {
				files: [{
					src: '<%= distDir %>/index.html',
					dest: '<%= distDir %>/index.php'
				}]
			},
			dev: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= devDir %>',
					dest: '<%= distDir %>/',
					src: [
						'sink.html',
						'*.php',
						'*.{ico,png,jpg,gif,txt,xml}',
						'.htaccess',
						'img/{,*/}*.{jpg,jpeg,png,gif,webp,cur}',
						'css/fontface.css',
						'css/fonts/*.{woff,eot,ttf,svg}',
						'js/conditional-resource/**/*',
						'data/**/*'
					]
				},
				{
					expand: true,
					dot: true,
					cwd: '.tmp/concat/',
					dest: '<%= distDir %>/',
					src: [
						'css/**/*',
						'js/**/*'
					]
				}]
			}
		},
		htmlmin: {
			dist: {
				options: {
					// removeCommentsFromCDATA: true,
					// // https://github.com/yeoman/grunt-usemin/issues/44
					// //collapseWhitespace: true,
					// collapseBooleanAttributes: true,
					// removeAttributeQuotes: true,
					// removeRedundantAttributes: true,
					// useShortDoctype: true,
					// removeEmptyAttributes: true,
					// removeOptionalTags: true
				},
				files: [{
					expand: true,
					cwd: '<%= devDir %>',
					src: ['*.html', 'template/**/*.html'],
					dest: '<%= distDir %>'
				}]
			}
		},
		svgmin: {
			options: {
				plugins: [
					{removeViewBox: false}
					// {removeUselessStrokeAndFill: false},
					// {
					// 	convertPathData: {
					// 		straightCurves: false // advanced SVGO plugin option
					// 	}
					// },
					// {removeRasterImages:true}
				]
			},
			dist: {
				files: [{
					expand: true,
					cwd: '<%= devDir %>/img',
					src: '**/*.svg',
					dest: '<%= distDir %>/img'
				}]
			}
		},
		ngmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '.tmp/concat/js',
					src: '*.js',
					dest: '.tmp/concat/js'
				}]
			}
		},
		uglify: {
			options:{
				compress: {},
				mangle: false
			},
			// dev: {
			// 	files: [
			// 		{
			// 			src: '<%= distDir %>/js/conditional-resource/*.js',  // source files mask
			// 			dest: '<%= distDir %>/js/conditional-resource/',    // destination folder
			// 			expand: true,    // allow dynamic building
			// 			flatten: true,   // remove all unnecessary nesting
			// 			// ext: '.min.js'   // replace .js to .min.js
			// 		}
			// 	],
			// 	options:{
			// 		compress: true,
			// 		mangle: false
			// 	}
			// },
			dist: {
				files: [
					{
						src: '<%= distDir %>/js/conditional-resource/*.js',  // source files mask
						dest: '<%= distDir %>/js/conditional-resource/',    // destination folder
						expand: true,    // allow dynamic building
						flatten: true,   // remove all unnecessary nesting
						// ext: '.min.js'   // replace .js to .min.js
					}
				]
			}
		},
		concurrent: {
			dev: [
				'ngtemplates:dev',
				'newer:sass'
				// 'sass'
			],
			dist: [
				'ngtemplates:dist',
				'sass',
				'svgmin',
				'htmlmin'
			]
		},
		useminPrepare: {
			html: '<%= devDir %>/index.html',
			options: {
				dest: '<%= distDir %>'
			}
		},
		usemin: {
				html: '<%= distDir %>/index.html'
		},
		browserSync: {
			dev: {
				bsFiles: {
					src : ['<%= devDir %>/**/*.html', '!<%= devDir %>/template/**/*.html', '<%= devDir %>/**/*.js', '<%= devDir %>/**/*.css']
				},
				options: {
					watchTask: true,
					ports: {
						min: 3003,
						max: 3005
					},
					ghostMode: {
						clicks: false,
						scroll: false,
						links: false, // must be false to avoid interfering with angular routing
						forms: false
					},
					server: {
						baseDir: "<%= devDir %>"
					}
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all : {
				src : ['<%= devDir %>/js/**/*.js']
			}
		},
		rev: {
			dist: {
				files: {
					src: [
						'<%= distDir %>/js/{,*/}*.js',
						'<%= distDir %>/css/{,*/}*.css',
						'!<%= distDir %>/css/fontface.css',
						'!<%= distDir %>/js/conditional-resource/{,*/}*.js'
					]
				}
			}
		},
		watch: {
			options : {
				interrupt: true
			},
			// js: {
			// 	files: ['<%= devDir %>/js/**/*.js'],
			// 	tasks: ['newer:jshint' ]
			// },
			// html : {
			// 	files: ['<%= devDir %>/**/*.html']
			// },
			// css: {
			// 	files: ['<%= devDir %>/css/**/*.css']
			// },
			sass: {
				files: ['<%= devDir %>/scss/**/*.scss'],
				tasks: ['sass:dev']
			},
			ngtemplates: {
				files: [ '<%= devDir %>/template/**/*.html' ],
				tasks: [ 'ngtemplates:dev' ]
			}
		},
		sass: {
			dev: {
				options: {
					// sourceComments: 'map',
					sourceMap: true,
					includePaths: [
						'<%= devDir %>/vendor/bootstrap-sass/vendor/assets/stylesheets',
						'<%= devDir %>/vendor/animate.scss/source',
						'<%= devDir %>/vendor/hint.css/src'
					],
					outputStyle: 'compressed' /*, nested, 'expanded' ,  'compact'*/
				},
				files: {
					'<%= devDir %>/css/app.css': '<%= devDir %>/scss/app.scss',
					'<%= devDir %>/css/fontface.css': '<%= devDir %>/scss/fontface.scss'
				}
				// files: [{
				// 	expand: true,
				// 	cwd: '<%= devDir %>/scss/',
				// 	src: [
				// 		'**/*.scss',
				// 		'!**/_*.scss'
				// 	],
				// 	dest: '<%= devDir %>/css/',
				// 	ext: '.css'
				// }]
			}
		},
		ngtemplates: {
			options: {
				module: 'TenLua',
			},

			dev: {
				cwd: '<%= devDir %>',
				src: 'template/**/*.html',
				dest: '<%= devDir %>/js/template.js',
				options: {
					htmlmin: {
						collapseBooleanAttributes: true,
						collapseWhitespace: true,
						removeAttributeQuotes: true,
						removeComments: true, // Only if you don't use comment directives!
						removeEmptyAttributes: false,
						removeRedundantAttributes: false,
						removeScriptTypeAttributes: true,
						removeStyleLinkTypeAttributes: true
					}
				}
			},
			dist: {
				cwd: '<%= devDir %>',
				src: 'template/**/*.html',
				dest: '<%= devDir %>/js/template.js',
				options: {
					htmlmin: {
						collapseBooleanAttributes: true,
						collapseWhitespace: true,
						removeAttributeQuotes: true,
						removeComments: true, // Only if you don't use comment directives!
						removeEmptyAttributes: false,
						removeRedundantAttributes: false,
						removeScriptTypeAttributes: true,
						removeStyleLinkTypeAttributes: true
					}
				}
			}
		},
		connect: {
			// test : {
			// 	options: {
			// 		port: 8887,
			// 		base: '<%= devDir %>',
			// 		keepalive: false,
			// 		livereload: false,
			// 		open: false
			// 	}
			// },
			dist: {
				options: {
					port: 3002,
					//hostname: '169.254.80.80',
					hostname: '10.135.81.111',
					base: '<%= distDir %>',
					keepalive: true,
					livereload: false,
					open: true
				}
			}
		},
		'string-replace': {
			dist1: {
				files: [{
					expand: true,
					cwd: '<%= distDir %>',
					src: ['index.html'],
					dest: '<%= distDir %>'
				},{
					expand: true,
					cwd: '<%= devDir %>',
					src: ['js/template.js'],
					dest: '<%= devDir %>',
				}],
				options: {
					replacements: [{
						pattern: '<script>var html5Mode = false;</script>',
						replacement: '<script>var html5Mode = true;</script>'
					},{
						pattern: /#!\//g,
						replacement: '/'
					}]
				}
			}
		}

	});



	// grunt.registerTask('dev', ['browserSync', 'watch']);
	// grunt.registerTask('package', ['jshint', 'clean', 'useminPrepare', 'copy', 'concat', 'ngmin', 'uglify',   'cssmin',  'rev',  'usemin']);
	// grunt.registerTask('ci', ['package'   ]);
	// grunt.registerTask('ls', ['availabletasks']);

	// grunt.registerTask('dev', ['newer:sass', 'browserSync', 'watch']);
	grunt.registerTask('dev', ['concurrent:dev', 'browserSync', 'watch']);
	grunt.registerTask('build', [
		// 'jshint',
		'clean',
		'useminPrepare',
		'concurrent:dist',
		'string-replace:dist1',
		'concat',
		// 'ngmin',
		// 'cssmin',
		'copy:dist',
		'uglify',
		'rev',
		'usemin',
		'copy:dist2'
	]);
	grunt.registerTask('buildquick', [
		'clean',
		'useminPrepare',
		'concurrent:dist',
		'string-replace:dist1',
		'concat',
		// 'ngmin',
		// 'uglify',
		// 'cssmin',
		'copy:dev',
		'rev',
		'usemin',
		'copy:dist2'
	]);

};