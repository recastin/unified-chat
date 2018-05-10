const app = require('express')(),
    http = require('http').Server(app),
    mysql = require('mysql2');

global.io = require('socket.io')(http);
global.config = require('./config');
global.connection = mysql.createConnection(global.config.db);
global.chatHandlers = {};

app.get('/', function(req, res){
    res.send('');
});

http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:' + (process.env.PORT || 3000).toString());
});

require('./src/ChatManager');