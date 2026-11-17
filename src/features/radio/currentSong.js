const { EmbedBuilder } = require('discord.js');
let lastSong;

async function getCurrentSong() {
    try {
        const response = await fetch('https://radio.gotanno.love/currentsong')
        if (!response.ok) {
            return { ok: false, message: response.statusText }
        }

        return await response.text();
    } catch (err) {
        console.log(err);
    }
}

async function sendCurrentSong(client) {
    const currentSong = await getCurrentSong();

    if (!currentSong) {
        return { ok: false }
    }

    if (currentSong === lastSong) {
        return;
    }

    lastSong = currentSong;

    try {
        const guild = await client.guilds.fetch('1379335961090986004');
        const channel = guild.channels.cache.get('1572292776794660926')
            ?? await guild.channels.fetch('1572292776794660926');

        const embed = new EmbedBuilder()
            .setDescription(`${currentSong}`)
            .setColor("Blurple")

        await channel.send({
            embeds: [embed],
        });
    } catch (err) {
        console.error(err);
        return { ok: false };
    }
}

module.exports = sendCurrentSong;