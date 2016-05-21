var fs			= require('fs');
var Path		= require('path');
var Promise		= require('bluebird');

var PATH_SEP = require('os').EOL;
var EOL = require('os').EOL;
var EOL_REGEX = /\r?\n/;
var ERR_NO_FILE = 'ENOENT';

var filequeues = {};

/**
 * @class
 * @param {string} path
 */
function File(path, encoding) {
	var self = this;
	if (!encoding) {encoding = 'utf8';}
	
	// Create file queue for this file.
	if (!filequeues[path]) {filequeues[path] = Promise.resolve();}
	var queue = filequeues[path];
	
	// Set properties.
	Object.defineProperty(this, 'path', {get: function() {
		return path;
	}});
	Object.defineProperty(this, 'name', {get: function() {
		return Path.basename(path);
	}});

	/**
	 * @returns {Promise<Boolean}
	 */
	this.delete = function() {
		return queue.finally(function() {
			return new Promise(function(resolve, reject) {
				return fs.unlink(self.path, function(err, response) {
					if (err) {reject(err);} else {resolve(response);}
				});
			});
		});
	};

	/**
	 * @param {String|Number|Buffer} data
	 * @param {Object|String} options
	 * @returns {Promise}
	 */
	this.writeLine = function(data, options) {
		return self.write(makeLine(data), options);
	};
	
	/**
	 * @param {String|Number|Buffer} data
	 * @param {Object|String} options
	 * @returns {Promise}
	 */
	this.write = function(data, options) {
		return queue.finally(function() {
			return new Promise(function(resolve, reject) {
				fs.writeFile(self.path, data, options, function(err, response) {
					if (err) {reject(err);} else {resolve(response);}
				});
			});
		});
	};

	/**
	 * @param {String|Number|Buffer} data
	 * @param {Object|String} options
	 * @returns {Promise}
	 */
	this.appendLine = function(data, options) {
		return self.append(makeLine(data), options);
	};
	
	/**
	 * @param {String|Number|Buffer} data
	 * @param {Object|String} options
	 * @returns {Promise}
	 */
	this.append = function(data, options) {
		return queue.then(function() {
			return new Promise(function(resolve, reject) {
				fs.appendFile(self.path, data, options, function(err, response) {
					if (err) {reject(err);} else {resolve(response);}
				});
			});
		});
	};
	
	function makeLine(data) {
		if (!data.endsWith(EOL)) {data += EOL;}
		return data;
	}
	
	/**
	 * @returns {Promise<String>}
	 */
	this.read = function() {
		return new Promise(function(resolve, reject) {
			fs.readFile(self.path, encoding, function(err, response) {
				if (err) {reject(err);} else {resolve(response);}
			});
		});
	};

	/**
	 * @returns {Promise<Array<String>>}
	 */
	this.readLines = function() {
		return self.read().then(function(data) {return data.split(EOL_REGEX);});
	};
	
	/**
	 * @returns {String}
	 */
	this.readSync = function() {
		return fs.readFileSync(self.path, encoding);
	};
	
	/**
	 * @returns {Array<String>}
	 */
	this.readLinesSync = function() {
		return self.readSync().split(EOL_REGEX);
	};
	
	/**
	 * @returns {Boolean}
	 */
	this.existsSync = function() {
		try {
			var statSync = fs.statSync(self.path);
			return statSync.isFile() || statSync.isDirectory();
		} catch (e) {
			if (e.code === ERR_NO_FILE) {return false;} else {throw e;}
		}
	};
}

module.exports = File;