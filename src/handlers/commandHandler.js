const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

/**
 * @param {import('../client')} client 
 */
module.exports = async (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const slashCommands = [];

    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
        return;
    }

    const readCommands = (dir, type) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                readCommands(fullPath, type);
            } else if (file.name.endsWith('.js')) {
                const command = require(fullPath);

                if (typeof command.execute !== 'function') {
                    console.warn(`The command at ${fullPath} is missing a required "execute" function.`);
                    continue;
                }

                if (type === 'slash') {
                    if (!command.data?.name || typeof command.data.toJSON !== 'function') {
                        console.warn(`The slash command at ${fullPath} is missing valid "data" or "execute" properties.`);
                        continue;
                    }

                    client.commands.set(command.data.name, command);
                    slashCommands.push(command.data.toJSON());
                    console.log(`Loaded slash command: ${command.data.name}`);
                    continue;
                }

                if (typeof command.name !== 'string' || !command.name.trim()) {
                    console.warn(`The prefix command at ${fullPath} is missing a valid "name" property.`);
                    continue;
                }

                const aliases = Array.isArray(command.aliases) ? command.aliases : [];
                const names = [command.name, ...aliases];
                for (const name of names) {
                    if (typeof name === 'string' && name.trim()) {
                        client.prefixCommands.set(name.toLowerCase(), command);
                    }
                }
                console.log(`Loaded prefix command: ${command.name}`);
            }
        }
    };

    for (const type of ['prefix', 'slash']) {
        const typePath = path.join(commandsPath, type);
        if (fs.existsSync(typePath)) {
            readCommands(typePath, type);
        }
    }

    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;

    if (token && clientId && slashCommands.length > 0) {
        const rest = new REST({ version: '10' }).setToken(token);

        try {
            console.log(`Registering ${slashCommands.length} application (/) commands...`);

            if (guildId) {
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: slashCommands }
                );
                console.log(`Successfully registered application commands to Guild ${guildId}.`);
            } else {
                await rest.put(
                    Routes.applicationCommands(clientId),
                    { body: slashCommands }
                );
                console.log('Successfully registered global application commands.');
            }
        } catch (error) {
            console.error('Error deploying application commands:', error);
        }
    }
};
