var setProgress = function (percent, statusLabel) {
    var progress = document.querySelector('.percent');
    progress.style.width = percent + '%';
    progress.textContent = percent + '%';
    document.getElementById('progress_bar').className = 'loading';

    document.getElementById('status').innerText = statusLabel;
};

var createCORSRequest = function (method, url) {
    var xhr = new XMLHttpRequest();
    if ('withCredentials' in xhr) {
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest !== 'undefined') {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
};

/**
* Execute the given callback with the signed response.
*/
var executeOnSignedUrl = function (file, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 's3?name=' + file.name + '&type=' + file.type, true);

    // Hack to pass bytes through unprocessed.
    xhr.overrideMimeType('text/plain; charset=x-user-defined');

    xhr.onreadystatechange = function ()  {
        if (this.readyState === 4 && this.status === 200) {
            callback(decodeURIComponent(this.responseText));
        } else if (this.readyState === 4 && this.status !== 200) {
            setProgress(0, 'Could not contact signing script. Status = ' + this.status);
        }
    };

    xhr.send();
};

/**
* Use a CORS call to upload the given file to S3. Assumes the url
* parameter has been signed and is accessable for upload.
*/
var uploadToS3 = function (file, url) {
    var xhr = createCORSRequest('PUT', url);
    if (!xhr) {
        setProgress(0, 'CORS not supported');
    } else {
        xhr.onload = function () {
            if (xhr.status === 200) {
                setProgress(100, 'Upload completed.');
            } else {
                setProgress(0, 'Upload error: ' + xhr.status);
            }
        };

        xhr.onerror = function (error) {
            setProgress(0, 'XHR error.' + error);
        };

        xhr.upload.onprogress = function (e) {
            console.log(e);
            if (e.lengthComputable) {
                var percentLoaded = Math.round((e.loaded / e.total) * 100);
                setProgress(percentLoaded, percentLoaded === 100 ? 'Finalizing.' : 'Uploading.');
            }
        };

        xhr.setRequestHeader('Content-Type', file.type);
        xhr.setRequestHeader('x-amz-acl', 'public-read');

        xhr.send(file);
    }
};

var uploadFile = function (file) {
    executeOnSignedUrl(file, function (signedURL) {
        uploadToS3(file, signedURL);
    });
};

var handleFileSelect = function (evt) {
    setProgress(0, 'Upload started.');

    var files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
        uploadFile(files[i]);
    }
};

document.getElementById('files').addEventListener('change', handleFileSelect, false);
setProgress(0, 'Waiting for upload.');



// var getSignedUrl = function (file) {
//     return $.ajax({
//         url: '/s3?name=' + file.name + '&type=' + file.type,
//         type: 'GET',
//         beforeSend: function (req) {
//             req.overrideMimeType('text/plain; charset=x-user-defined');
//         }
//     });
// };

// var uploadFile = function (file, signedUrl) {
//     return $.ajax({
//         type:'PUT',
//         url: decodeURIComponent(signedUrl),
//         beforeSend: function (req) {
//             req.overrideMimeType(file.type);
//             req.setRequestHeader('x-requested-with', '*');
//             req.setRequestHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//             req.setRequestHeader('Access-Control-Allow-Headers', '*')
//             req.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//             req.setRequestHeader('Content-Type', file.type);
//             req.setRequestHeader('x-amz-acl', 'public-read');
//         }
//     });
// }

// var handleFileSelect = function (evt) {
//     console.log('Upload started.');

//     var files = evt.target.files;
//     _.each(files, function (file) {
//         return getSignedUrl(file).then(_.partial(uploadFile, file));
//     });
// };

// $(document).ready(function () {
//     $('#files').change(handleFileSelect);
//     console.log('Waiting for upload.');
// });

