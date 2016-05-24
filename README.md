# si-file

A general-purpose File object to assist with any project, using Promises for asynchronous operations.

It uses the [Bluebird](https://www.npmjs.com/package/bluebird) implementation of Promises. 

## Basic usage

#### Instantiation
For basic instantiation, simply require the library and pass in the file path as a constructor parameter.

```js
var File = require('si-file');

var file = new File('dir/myFile.txt');
```
##### Encoding Type
You may optionally specify the file encoding type as a second parameter, which will be used for all read/write operations.
If you do not specify an encoding then `utf8` will be used by default.

```js
var file = new File('dir/myFile.txt', 'ascii');
```

Node supports the following encoding types:
 - `utf-8` (or `utf8`)
 - `ascii`
 - `base64`
 - `binary`
 - `hex`
 - `ucs-2` (or `ucs2`, `utf16le`, or `utf-16le`)


#### File Properties

File has two read-only properties.  Use `file.path` to get the full path of the file, as passed into the constructor.
You can also use `file.name` get the filename only, without the directory (but including the file extension, if applicable).

```js
var file = new File('dir/myFile.txt');

file.path === 'dir/myFile.txt'; // true
file.name === 'myFile.txt';     // true
file.ext === 'txt';             // true
```

You can also use `dir` to get a new `File` object representing the parent directory of the current file, or `null` if the file is at the root level (i.e. has no parent directory).
```js
file.dir.name === 'dir';       // true
```

To see whether the file actually exists on the filesystem, use `file.exists()` or `file.existsSync()`.

```js
file.exists().then(function(doesExist) {
  if (doesExist) {
    // file exists
  }
});

if (file.existsSync()) {
  // file exists
}
```

Other methods are available to distinguish between folders and files.

```js
file.isDirectory().then(function(isDirectory) {
  if (isDirectory) {
    // the directory exists
  }
});

file.isFile().then(function(isFile) {
  if (isFile) {
    // the file exists (and it's not a directory)
  }
});
```

To create a directory use `file.mkdir()`.  If the directory already exists it will return a successful promise, but if a file exists of the same name then it will return a failed promise.

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

You can also write a single line, which will append the system-appropriate line ending (`\n` or `\r\n`) to the end of the given string, if it does not already end with that character.  Any existing line endings within the string are preserved.

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