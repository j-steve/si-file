var Path      = require('path');
var Promise   = require('bluebird');
var fs        = Promise.promisifyAll(require('fs'));

var EOL = require('os').EOL;
var EOL_REGEX = /\r?\n/;
var ERR_NO_FILE = 'ENOENT';

var filequeues = {};

/**
 * @class
 * @param {string} path
 * @param {string} [encoding='utf8']
 */
function File(path, encoding) {
	var self = this;
	if (!encoding) {encoding = 'utf8';}
	
	// Create file queue for this file.
	if (!filequeues[path]) {filequeues[path] = Promise.resolve();}
	var queue = filequeues[path];
	
	// --------------------------------------------------
	// Properties
	// --------------------------------------------------

	Object.defineProperty(this, 'path', {get: function() {
		return path;
	}});
	Object.defineProperty(this, 'name', {get: function() {
		return Path.basename(path);
	}});

	// --------------------------------------------------
	// Methods
	// --------------------------------------------------

	/**
	 * @returns {Promise<Boolean}
	 */
	this.delete = function() {
		return queue = queue.finally(function() {
			return fs.unlinkAsync(self.path).catch({code: ERR_NO_FILE}, function() {});
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
		return queue = queue.finally(function() {
			return fs.writeFileAsync(self.path, data, options);
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
		return queue = queue.finally(function() {
			return fs.appendFileAsync(self.path, data, options);
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
		return queue = queue.finally(function() {
			return fs.readFileAsync(self.path, encoding);
		});
	};

	/**
	 * @returns {Promise<Array<String>>}
	 */
	this.readLines = function() {
		return queue = queue.finally(function() {
			return self.read().then(function(data) {return data.split(EOL_REGEX);});
		});
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
	 * @returns {Promise<Boolean>}
	 */
	this.exists = function() {
		return queue = queue.finally(function() {
			return fs.statAsync(self.path).then(function(result) {
				return result.isFile() || result.isDirectory();
			}).catch({code: ERR_NO_FILE}, function() {return false;});
		});
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