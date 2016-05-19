# si-file

A general-purpose File object to assist with any Node project.

## Usage

```javascript
var file = new File("C:\myFile.txt");
file.write("some data").then(function() {
	var lines = file.readLinesSync();
});
```