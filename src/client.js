const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');
const commandHandler = require('./handlers/commandHandler');
const sendCurrentSong = require('./features/radio/currentSong.js');

class Bot extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildVoiceStates
            ],
            partials: [
                Partials.Channel,
                Partials.Message,
            ]
        });

        this.commands = new Collection();
        this.prefixCommands = new Collection();
        this.prefix = 's!'
    }

    async init(token) {
        await commandHandler(this);
        await eventHandler(this);

        await this.login(token);
        await sendCurrentSong(this);
        setInterval(() => sendCurrentSong(this), 60 * 1000);
    }
}

module.exports = Bot;
