module.exports = function(grunt) {
	var config = require('./.screeps.json')
	// 加载插件
	grunt.loadNpmTasks('grunt-screeps');

	grunt.initConfig({
		screeps: {
			options: {
				email: config.email,
				token: config.password,
				branch: config.branch,
				// server: 'season'
				ptr: config.ptr
			},
			dist: {
				// v1: ['v1/*.js']
				src: ['v2/*.js']
			}
		}
	});
}
