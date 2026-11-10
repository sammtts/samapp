const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

/**
 * @param {import('../client')} client 
 */
module.exports = async (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandsArray = [];

    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
        return;
    }

    const readCommands = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                readCommands(fullPath);
            } else if (file.name.endsWith('.js')) {
                const command = require(fullPath);

                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    commandsArray.push(command.data.toJSON());
                    console.log(`Loaded command: ${command.data.name}`);
                } else {
                    console.warn(`The command at ${fullPath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    };

    readCommands(commandsPath);

    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;

    if (token && clientId && commandsArray.length > 0) {
        const rest = new REST({ version: '10' }).setToken(token);

        try {
            console.log(`Registering ${commandsArray.length} application (/) commands...`);

            if (guildId) {
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commandsArray }
                );
                console.log(`Successfully registered application commands to Guild ${guildId}.`);
            } else {
                await rest.put(
                    Routes.applicationCommands(clientId),
                    { body: commandsArray }
                );
                console.log('Successfully registered global application commands.');
            }
        } catch (error) {
            console.error('Error deploying application commands:', error);
        }
    }
};
