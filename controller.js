var url = require('url'),
    path = require('path'),
    fs = require('fs'),
    staticFileMimeTypes = {
        'html': 'text/html',
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'js': 'text/javascript',
        'css': 'text/css'
    },

    // all keys should be in lower case
    routes = {
        // redirect root path to main.html
        '/': function(pathname, req, res){
            staticFile('/index.html', req, res)
        },

        '/laborpains/history': GET_data,
        '/laborpains/mark': POST_mark
    };

function staticFile(pathname, req, res) {
    var filename = path.join(process.cwd(), '/www' + pathname.toLowerCase()),
        fileext = path.extname(filename).split('.')[1],
        mimeType = staticFileMimeTypes[fileext.toLowerCase()];

    function fileNotFound() {
    	console.warn('HTTP 404: ' + filename);
            
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('404 File Not Found.\n');
        res.end();
    }

    function responseFile() {
		res.writeHead(200, {'Content-Type': mimeType});
		fs.createReadStream(filename).pipe(res);
    }

    if(fileext) {
    	fs.exists(filename, function(exists){
    		exists ? responseFile() : fileNotFound();
    	});
    }
}

function fail(res, responseText) {
    res.writeHead(500);
    responseText && res.write(responseText);
    res.end();
}

function response(res, responseResult) {
    res.writeHead(200);
    responseResult && res.write(JSON.stringify(responseResult));
    res.end();
}

function GET_data(pathname, req, res) {
    fs.readFile(path.join(process.cwd(), '/laborpainsdata.js'), 'utf8', function (err, data) {
      if (err) {
        return fail(res, 'Error reading laborpainsdata.js.');
      }

      response(res, data);
    });
}

function POST_mark(pathname, req, res) {
    function pushData(tick) {
        var datafile = path.join(process.cwd(), '/laborpainsdata.js'),
            encoding = 'utf8';

        fs.readFile(datafile, encoding, function (err, data) {
            if (err) {
                return fail(res, 'Error reading laborpainsdata.js: ' + err);
            }

            var records = JSON.parse(data);
            records.push(tick);

            fs.writeFile(datafile, JSON.stringify(records), encoding, function (err) {
                if (err) {
                    return fail(res, 'Error reading data.js: ' + err);
                }
                
                response(res, true);
            });
        });
    }

    if (req.method !== 'POST') {
        return fail(res, 'Must use POST.');
    }

    var body = '';
    req.on('data', function (data) {
        body += data.toString();
    });

    req.on('end', function () {
        var postTick = JSON.parse(body);
        pushData(postTick);
    });
} 

exports.handleRequest = function (req, res) {
    console.info(req.method + ' ' + req.url);

    var pathname = (url.parse(req.url).pathname || '').toLowerCase(),
        fnHandler = routes[pathname] || staticFile;

    fnHandler(pathname, req, res);
};