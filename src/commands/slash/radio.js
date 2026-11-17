const { SlashCommandBuilder, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType,
} = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('radio')
        .setDescription('Play Gotanno\'s radio in your voice channel'),
    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        if (!channel) {
            return interaction.reply({
                content: 'You need to be in a voice channel.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply();

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true
        });

        await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

        const player = createAudioPlayer();
        const prism = require('prism-media');

        const createResource = () => {
            const ffmpeg = new prism.FFmpeg({
                args: [
                    '-reconnect', '1',
                    '-reconnect_streamed', '1',
                    '-reconnect_delay_max', '5',
                    '-i', 'https://radio.gotanno.love/;',
                    '-analyzeduration', '0',
                    '-loglevel', '32',
                    '-f', 's16le',
                    '-ar', '48000',
                    '-ac', '2',
                ],
            });

            return createAudioResource(ffmpeg, { inputType: StreamType.Raw });
        };

        player.play(createResource());
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => player.play(createResource()));
        player.on('error', (err) => {
            console.error(err);
            player.play(createResource());
        });

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch {
                connection.destroy();
                player.stop();
            }
        });

        const embed = new EmbedBuilder()
            .setTitle('<:disc:1572295418925027429> Playing Gotanno\'s station')
            .setDescription('You\'re listening to Gotanno\'s station. Please support them listening' +
                ' [here](https://discord.com/invite/FQYMJ222xz) or joining their Discord server.'
            )
            .setThumbnail('https://i.imgur.com/IapBTrC.png')
            .setColor("Blurple")

        const button = new ButtonBuilder()
            .setLabel('Join Discord server')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.com/invite/FQYMJ222xz')

        await interaction.editReply({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(button)]
        });
    }
}