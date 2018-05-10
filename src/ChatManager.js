
class ChatManager {
    constructor() {
        this.clients = {};

        global.chatHandlers.twitch = require('./ChatHandler/Twitch');

        global.io.on('connection', socket => {
            // name = shyim/test-stream
            socket.on('chat', name => {
                if (typeof this.clients[name] === "undefined") {
                    this.clients[name] = [];
                }

                this.clients[name].push(socket);
                socket.streamName = name;
            });

            socket.on('disconnect', () => {
                if (socket.streamName) {
                    this.clients[socket.streamName].splice(this.clients[socket.streamName].indexOf(socket), 1);
                }
            });
        });

        Promise.all([global.chatHandlers.twitch.ready()]).then(() => {
            this.load();
        });
    }

    sendMessage(streamName, message) {
        if (typeof this.clients[streamName] !== 'undefined') {
            this.clients[streamName].forEach(client => {
                client.emit('message', message);
            })
        }
    }

    load() {
        global.connection.query('SELECT\n' +
            'CONCAT(user.username, "/", streams.name) as streamName,\n' +
            'LOWER(endpoint.`type`) as chatType,\n' +
            'endpoint.channelName as chatChannel\n' +
            'FROM streams\n' +
            'INNER JOIN endpoint ON(endpoint.stream_id = streams.id AND endpoint.active = 1)\n' +
            'INNER JOIN user ON(user.id = streams.user_id)\n' +
            'WHERE streams.active = 1', (err, results) => {
            Object.keys(global.chatHandlers).forEach((handlerName) => {
                global.chatHandlers[handlerName].updateChannels(results);
            });
        });
    }
}

global.chatManager = new ChatManager();