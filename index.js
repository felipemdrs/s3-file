'use strict';

var  isStream = require('is-stream'),
           fs = require('fs'),
          AWS = require('aws-sdk'),
         path = require('path');

var s3;

function upload(input, fileKey, bucket, cb) {
  var params = {
    'Bucket': bucket,
    'Key': fileKey,
    'Body': input
  };

  s3.upload(params, cb);
}

function fileInfo (fileKey, bucket, cb) {
  var params = {
    'Bucket': bucket,
    'Key': fileKey
  };

  s3.headObject(params, function (err, metadata) {
    cb(err, metadata);
  }); 
}

function fileExists(fileKey, bucket, cb) {
  fileInfo(fileKey, bucket, function (err) {
    cb(!(err && err.code === 'NotFound'));
  });
}

function downloadToStream(fileKey, bucket, cb) {
  var params = {
    'Bucket': bucket,
    'Key': fileKey
  };

  fileExists(fileKey, bucket, function (exists) {
    if (!exists) {
      cb('NotFound');
    } else {
      cb(null, s3.getObject(params).createReadStream());
    }
  });
}

function downloadToFile(fileKey, bucket, outputPath, cb) {
  downloadToStream(fileKey, bucket, function (err, stream) {
    if (err) {
      cb (err);
    } else {
      var filename = path.join(outputPath, fileKey);
      var writeStream = fs.createWriteStream(filename);

      writeStream.on('error', function (err) {
        cb(err);
      });

      writeStream.on('finish', function () {
        cb(null, filename);
      });

      stream.pipe(writeStream);
    }
  });
}

function deleteFile(fileKey, bucket, cb) {
  var params = {
    'Bucket': bucket,
    'Key': fileKey
  };

  s3.deleteObject(params, cb);
}

function fallback() {}

/**
*
* Upload local file to Amazon S3
*
* @param {string} config - Full path of Amazon AWS config file
* @example { "accessKeyId": "", "secretAccessKey": "", "region": "" }
*
*/
module.exports = function(config) {
  AWS.config.loadFromPath(config);
  s3 = new AWS.S3({apiVersion: '2006-03-01'});

  return {

    /**
    *
    * Upload local file to Amazon S3
    *
    * @param {string|Stream} input - Full path of file to upload or a readstream
    * @param {string} fileKey - The filename, unique filename to persist on S3
    * @param {string} bucket - The bucket created in S3
    * @param {function(error, object)} cb - A callback thats indicate if error has ocurred, case success returns the upload metadata
    *
    */
    upload: function(input, fileKey, bucket, cb) {
      if (isStream(input)) {
        upload(input, fileKey, bucket, cb || fallback);
      } else {
        var stream = fs.createReadStream(input);

        stream.on('error', function (err) {
          cb(err);
        });

        stream.on('open', function () {
          upload(stream, fileKey, bucket, cb || fallback);
        });
      }
    },

    /**
    *
    * Download S3 file to stream
    *
    * @param {string} fileKey - The filename, unique filename to persist on S3
    * @param {string} bucket - The bucket created in S3
    * @param {function(error, Stream)} cb - A callback thats indicate if error has ocurred, case success returns the stream
    *
    */
    downloadToStream: function(fileKey, bucket, cb) {
      downloadToStream(fileKey, bucket, cb || fallback);
    },

    /**
    *
    * Download S3 file to local file
    *
    * @param {string} fileKey - The filename, unique filename to persist on S3
    * @param {string} bucket - The bucket created in S3
    * @param {ouputPath} outputPath - The local path to save S3 file. The destiny is outputPath/fileKey
    * @param {function(error, string)} cb - A callback thats indicate if error has ocurred, case success returns the full path
    *
    */
    downloadToFile: function(fileKey, bucket, outputPath, cb) {
      downloadToFile(fileKey, bucket, outputPath, cb || fallback);
    },

    /**
    *
    * Check if file exists on S3
    *
    * @param {string} fileKey - The filename, unique filename to persist on S3
    * @param {string} bucket - The bucket created in S3
    * @param {function(error, boolean)} cb - A callback thats indicate if error has ocurred, case success returns bool of file existence
    *
    */
    fileExists: function(fileKey, bucket, cb) {
      fileExists(fileKey, bucket, cb || fallback);
    },

    /**
    *
    * Get file info on S3
    *
    * @param {string} fileKey - The filename, unique filename to persist on S3
    * @param {string} bucket - The bucket created in S3
    * @param {function(error, Object)} cb - A callback thats indicate if error has ocurred, case success returns bool of file metadata
    *
    */
    fileInfo: function(fileKey, bucket, cb) {
      fileInfo(fileKey, bucket, cb || fallback);
    },

    /**
    *
    * Delete a file on S3
    *
    * @param {string} fileKey - The filename, unique filename to persist on S3
    * @param {string} bucket - The bucket created in S3
    * @param {function(error)} cb - A callback thats indicate if error has ocurred
    *
    */
    deleteFile: function(fileKey, bucket, cb) {
      deleteFile(fileKey, bucket, cb || fallback);
    }
  };
};
