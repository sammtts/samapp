const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');
const commandHandler = require('./handlers/commandHandler');

class Bot extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
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
    }
}

module.exports = Bot;
