const irc = require('irc-upd');

class Twitch {
    constructor() {
        this.joinedChannsls = [];
        this.channelMapping = {};
        this.clientReady = false;

        this.client = new irc.Client('irc.chat.twitch.tv', global.config.services.twitch.nick, {
            userName: global.config.services.twitch.nick,
            password: global.config.services.twitch.password
        });

        this.client.addListener('message#', this.handleMessages);

        this.client.on('error', (err) => {
            console.log(err);
        });

        this.client.addListener('registered', () => {
            this.clientReady = true;
        })
    }

    ready() {
        return new Promise((resolve, reject) => {
            if (this.clientReady) {
                resolve();
                return;
            }

            this.client.addListener('registered', () => {
                resolve();
            })
        });
    }

    updateChannels(channels) {
        this.channelMapping = {};

        channels.forEach(channel => {
            if (channel.chatType !== 'twitch') {
                return;
            }
            channel.chatChannel = channel.chatChannel.toLowerCase();

            if (this.joinedChannsls.indexOf(channel.chatChannel) === -1) {
                this.client.join('#' + channel.chatChannel);
                this.joinedChannsls.push(channel.chatChannel);
            }

            if (typeof this.channelMapping[channel.chatChannel] === 'undefined') {
                this.channelMapping[channel.chatChannel] = [];
            }

            if (this.channelMapping[channel.chatChannel].indexOf(channel.streamName) === -1) {
                this.channelMapping[channel.chatChannel].push(channel.streamName)
            }
        });
    }

    handleMessages(nick, to, text) {
        let twitchChannel = to.substr(1);

        if (typeof module.exports.channelMapping[twitchChannel] !== 'undefined') {
            module.exports.channelMapping[twitchChannel].forEach(streamName => {
                global.chatManager.sendMessage(streamName, `[Twitch] ${nick}: ${text}`);
            });
        }
    }
}

module.exports = new Twitch();