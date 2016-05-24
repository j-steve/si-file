var Path      = require('path');
var Promise   = require('bluebird');
var fs        = Promise.promisifyAll(require('fs'));

var EOL = require('os').EOL;
var EOL_REGEX = /\r?\n/;
var ERR_NO_FILE = 'ENOENT';

var q = {};

/**
 * @class
 * @param {string} path
 * @param {string} [encoding='utf8']
 */
function File(path, encoding) {
	var self = this;
	if (!encoding) {encoding = 'utf8';}
	
	// Create file q[self.path] for this file.
	if (!q[self.path]) {q[self.path] = Promise.resolve();}
	
	// --------------------------------------------------
	// Public Properties
	// --------------------------------------------------

	Object.defineProperty(this, 'path', {get: function() {
		return path;
	}});
	Object.defineProperty(this, 'name', {get: function() {
		return Path.basename(self.path);
	}});
	Object.defineProperty(this, 'dir', {get: function() {
		var dirName = Path.dirname(self.path);
		return dirName ? new File(dirName) : null;
	}});
	Object.defineProperty(this, 'ext', {get: function() {
		return Path.extname(self.path);
	}});

	// --------------------------------------------------
	// Public Methods
	// --------------------------------------------------
	
	/**
	 * @param {String} [mode=0777]
	 * @returns {Promise}
	 */
	 this.mkdir = function(mode) {
		return q[self.path] = self.isDir().then(function(isDir) {
			if (!isDir) {return fs.mkdirAsync(self.path, mode);}
		});
	};

	/**
	 * @returns {Promise<Boolean}
	 */
	this.delete = function() {
		return q[self.path] = q[self.path].finally(function() {
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
		return q[self.path] = ensureDirExists().then(function() {
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
		return q[self.path] = ensureDirExists().then(function() {
			return fs.appendFileAsync(self.path, data, options);
		});
	};
	
	/**
	 * @returns {Promise<String>}
	 */
	this.read = function() {
		return q[self.path] = q[self.path].finally(function() {
			return fs.readFileAsync(self.path, encoding);
		});
	};

	/**
	 * @returns {Promise<Array<String>>}
	 */
	this.readLines = function() {
		return q[self.path] = q[self.path].finally(function() {
			return self.read().then(function(data) {
				return data.split(EOL_REGEX);
			});
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
	 * Returns {@code true} if this file exists.
	
	 * @returns {Promise<Boolean>}
	 */
	this.exists = function() {
		return q[self.path] = stat().then(function(stat) {
			return stat && (stat.isFile() || stat.isDirectory());
		});
	};
	
	/**
	 * Returns {@code true} if this file exists.
	 * 
	 * @returns {Boolean}
	 */
	this.existsSync = function() {
		try {
			var stat = fs.statSync(self.path);
			return stat.isFile() || stat.isDirectory();
		} catch (e) {
			if (e.code === ERR_NO_FILE) {return false;} else {throw e;}
		}
	};
	
	/**
	 * Returns {@code true} if this file exists and is a file (not a directory).
	 * 
	 * @returns {Promise<Boolean>}
	 */
	this.isFile = function() { 
		return q[self.path] = stat().then(function(stat) {
			return stat && stat.isFile();
		});
	};
	
	/**
	 * Returns {@code true} if this file exists and is a directory.
	 * 
	 * @returns {Promise<Boolean>}
	 */
	this.isDir = function() { 
		return q[self.path] = stat().then(function(stat) {
			return stat && stat.isDirectory();
		});
	};

	// --------------------------------------------------
	// Private Functions
	// --------------------------------------------------
	
	/**
	 * @returns {Promise<Stat>}
	 */
	function stat() {
		return q[self.path].finally(function() {
			return fs.statAsync(self.path).catchReturn({code: ERR_NO_FILE}, false);
		});
	}
	
	/**
	 * @returns {Promise}
	 */
	function ensureDirExists() {
		return q[self.path].finally(self.dir.mkdir);
	}
	
	function makeLine(data) {
		if (!data.endsWith(EOL)) {data += EOL;}
		return data;
	}
}

module.exports = File;