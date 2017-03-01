var assert = require('chai').assert,
      path = require('path'),
        fs = require('fs');

var configPath = path.join(__dirname, 'config.json');
var bucket = require(configPath).bucket;
var s3 = require('../index')(configPath);

describe('file exists', function() {
  it('should not exist file', function(done) {
    s3.fileExists('example.txt', bucket, function (result) {
      assert.isFalse(result);
      done();
    });
  });

  it('should be uploaded using path', function (done) {
    s3.upload(path.join(__dirname, 'example.txt'), 'example.txt', bucket, function (err, metadata) {
      assert.isNull(err);
      assert.equal('example.txt', metadata.key);
      done();
    });
  });

  it('should exist file', function (done) {
    s3.fileExists('example.txt', bucket, function (result) {
      assert.isTrue(result);
      done();
    });
  });
});

describe('file delete', function () {
  it('should be exist', function (done) {
    s3.fileExists('example.txt', bucket, function (result) {
      assert.isTrue(result);
      done();
    });
  });

  it('should be delete', function (done) {
    s3.deleteFile('example.txt', bucket, function () {
      done();
    });
  });

  it('should be no exist', function (done) {
    s3.fileExists('example.txt', bucket, function (result) {
      assert.isFalse(result);
      done();
    });
  });
});

describe('file upload', function () {
  it('should be no exist', function (done) {
    s3.fileExists('example.txt', bucket, function (result) {
      assert.isFalse(result);
      done();
    });
  });

  it('should be uploaded using stream', function (done) {
    s3.upload(fs.createReadStream(path.join(__dirname, 'example.txt')), 'example-stream.txt', bucket, function (err, metadata) {
      assert.isNull(err);
      assert.equal('example-stream.txt', metadata.key);
      done();
    });
  });

  it('should be exist', function (done) {
    s3.fileExists('example-stream.txt', bucket, function (result) {
      assert.isTrue(result);
      done();
    });
  });

  it('should be downloaded to file', function (done) {
    var output = path.join(__dirname, 'example-stream.txt');

    s3.downloadToFile('example-stream.txt', bucket, __dirname, function (err, filename) {
      assert.isNull(err);
      assert.equal(output, filename);
         
      fs.readFile(output, 'utf8', function (err, data) {
        assert.isNull(err);
        assert.equal('Hello Kakaki\n', data);

        fs.unlinkSync(path.join(__dirname, 'example-stream.txt'));

        done();
      });
    });
  });

  it('should be downloaded to stream', function (done) {
    s3.downloadToStream('example-stream.txt', bucket, function (err, stream) {
      assert.isNull(err);
      
      var writeStream = fs.createWriteStream(path.join(__dirname, 'example-stream.txt'));

      writeStream.on('finish', function () {
        fs.readFile(path.join(__dirname, 'example-stream.txt'), 'utf8', function (err, data) {
          assert.isNull(err);
          assert.equal('Hello Kakaki\n', data);

          fs.unlinkSync(path.join(__dirname, 'example-stream.txt'));

          done();
        });
      });

      stream.pipe(writeStream);
    });
  });

  it('should be delete', function (done) {
    s3.deleteFile('example-stream.txt', bucket, function () {
      done();
    });
  });
});
