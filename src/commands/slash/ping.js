const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde con el ping del bot'),
    async execute(interaction, client) {
        const sent = await interaction.reply({ content: 'Calculando ping...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        await interaction.editReply(`🏓 **Pong!**\n⏱️ Latencia: **${latency}ms**\n💓 API: **${apiLatency}ms**`);
    }
};
