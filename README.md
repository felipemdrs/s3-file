# s3-file
Simple module to manage files (upload, download, delete) on the Amazon S3

## Code example
```javascript
var s3 = require('s3-file')('pathToAWSConfig');

s3.upload('./myFilePath.txt', 'fileKey', 'bucket', function (err, metadata) {
  if (err) return console.log(err);
  console.log(metadata);
});
```

## AWS config example
```json
{
  "accessKeyId": "ACCESS_KEY",
  "secretAccessKey": "SECRET_KEY",
  "region": "REGION"
}
````

## API

### Upload file

#### From stream

```javascript
var stream = fs.createReadStream('./myFilePath.txt');

s3.upload(stream, 'fileKey', 'bucket', function (err, metadata) {
  if (err) return console.log(err);
  console.log(metadata);
});
```

#### From file path

```javascript
s3.upload('./myFilePath.txt', 'fileKey', 'bucket', function (err, metadata) {
  if (err) return console.log(err);
  console.log(metadata);
});
```

### Download file

#### To stream

```javascript
s3.download('fileKey', 'bucket').toStream(function (err, stream) {
  if (err) return console.log(err);
  console.log('done');
});
```

#### To file

```javascript
s3.download('fileKey', 'bucket').toFile('./myS3file.txt', function (err, stream) {
  if (err) return console.log(err);
  console.log('done');
});
```

### File exists

```javascript
s3.fileExists('fileKey', 'bucket', function (result) {
  console.log(result);
});
```

### Delete file

```javascript
s3.deleteFile('fileKey', 'bucket', function (err) {
  if (err) return console.log(err);
  console.log('done');
});
```

## Test

Edit config.json in test folder and fill all fields with your credentials.

```
npm test
```

## License

[MIT](LICENSE)
