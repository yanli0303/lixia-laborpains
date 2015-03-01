var controller = require('./controller.js'),
    app = require('http').createServer(controller.handleRequest);

app.listen(81);
console.info('Server running at http://0.0.0.0:81/');