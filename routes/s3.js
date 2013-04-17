var crypto = require('crypto');
var nconf = require('nconf');
nconf.file({ file: '.env' });

var getSignature = function (accessId, accessKey, httpMethod, bucket, path, contentType, expires) {
    var contentMD5 = '',
        canonicalizedAmzHeaders = 'x-amz-acl:public-read',
        canonicalizedResource = '/' + bucket + path,
        stringToSign = httpMethod + '\n' + contentMD5 + '\n' + contentType + '\n' + expires +
                       '\n' + canonicalizedAmzHeaders + '\n' + canonicalizedResource,
        hmac = crypto.createHmac('sha1', accessKey);

    console.log('stringToSign', stringToSign);
    hmac.update(stringToSign);
    return hmac.digest('base64');
};

var s3 = function (accessId, accessKey, bucket) {
    this.accessKey = accessKey;
    this.accessId = accessId;
    this.bucket = bucket;
};

s3.prototype.signedUrl = function (filePath, contentType) {
    var expires = parseInt(new Date().getTime() / 1000, 10) + 60;
    var sig = getSignature(this.accessId, this.accessKey,
        'PUT', this.bucket, filePath, contentType, expires);

    var s3url = 'http://s3.amazonaws.com/';
    var url = encodeURIComponent(s3url + this.bucket + filePath + '?AWSAccessKeyId=' + this.accessId + '&Expires=' + expires + '&Signature=' + sig);
    return url;
};

exports.sign = function (req, res) {
    console.log(req.query);
    // example usage
    console.log('signing script!');
    var filePath = '/' + req.query.name;
    var contentType = req.query.type;
    console.log(process.env);
    var url = new s3(nconf.get('S3_ID'), nconf.get('S3_SECRET'), 'torrentForge').signedUrl(filePath, contentType);
    res.send(200, url);
};

exports = s3;
