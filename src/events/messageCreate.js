const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot || !message.content.startsWith(client.prefix)) return;

        const input = message.content.slice(client.prefix.length).trim();
        if (!input) return;

        const [commandName, ...args] = input.split(/\s+/);
        const command = client.prefixCommands.get(commandName.toLowerCase());
        if (!command) return;

        try {
            await command.execute(message, args, client);
        } catch (error) {
            console.error(`Error executing prefix command ${commandName}:`, error);
            await message.reply('An error occurred while trying to execute this command.');
        }
    }
};
