# si-file

A general-purpose File object to assist with any project, using Promises for asynchronous operations.

It uses the [Bluebird](https://www.npmjs.com/package/bluebird) implementation of Promises. 

## Basic usage

#### Instantiation

```js
var File = require('si-file');

var file = new File("C:\myFile.txt");
```

#### File Properties

```js
var myPath = file.path

if (file.existsSync()) {
	// file exists
}
```

## Reading

#### Async

The asynchronous methods return Promises of the requested data.

```js
file.read().then(function(fileData) {
	// file has been read; fileData is the full contents
}).catch(function(err) {
	// handle any errors
});

file.readLines().then(function(fileDataLines) {
	// file has been read; fileDataLines is an array of its lines
});
```

#### Synchronous

The read methods are also available in synchronous forms, using `file.readSync()` and `file.readLinesSync()`.

## Writing

Use `file.write()` to write data asynchronously.  Optionally pass options as a second parameter.

```js
file.write("some data").then(function() {
	// file is written
});
```

You can also write a single line, which will append the system-appropriate line ending ("\n" or "\r\n") to the end of the given string, if it does not already end with that character.  Any existing line endings within the string are preserved.

```js
file.writeLine("some data").then(function() {
	// file is written
});
```

#### Appending

You can also use `file.append()` and `file.appendLine()`, which work like their "write" counterparts except that they append the data to the given file rather than overwriting the entire file.

## File Deletion

```js
file.delete().then(function() {
	// file is deleted
});
```