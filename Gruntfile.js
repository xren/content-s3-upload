'use strict';
module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                '*.js',
                'test/*.js',
                'routes/*.js',
                'public/javascripts/*.js'
            ]
        },
        mochaTest: {
            files: [
                'test/*.js'
            ]
        },
        mochaTestConfig: {
            options: {
                reporter: 'spec'
            }
        }
    });

    // Default task.
    grunt.registerTask('default', ['jshint', 'mochaTest']);
};
