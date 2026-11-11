const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const { TranslationServiceClient } = require("@google-cloud/translate");
require("dotenv").config();

const translationClient = new TranslationServiceClient();

const LANGUAGES = [
    { name: 'Arabic',     code: 'ar', flag: '🇸🇦' },
    { name: 'Chinese',    code: 'zh', flag: '🇨🇳' },
    { name: 'Czech',      code: 'cs', flag: '🇨🇿' },
    { name: 'Dutch',      code: 'nl', flag: '🇳🇱' },
    { name: 'English',    code: 'en', flag: '🇬🇧' },
    { name: 'French',     code: 'fr', flag: '🇫🇷' },
    { name: 'German',     code: 'de', flag: '🇩🇪' },
    { name: 'Greek',      code: 'el', flag: '🇬🇷' },
    { name: 'Hebrew',     code: 'he', flag: '🇮🇱' },
    { name: 'Hindi',      code: 'hi', flag: '🇮🇳' },
    { name: 'Indonesian', code: 'id', flag: '🇮🇩' },
    { name: 'Italian',    code: 'it', flag: '🇮🇹' },
    { name: 'Japanese',   code: 'ja', flag: '🇯🇵' },
    { name: 'Korean',     code: 'ko', flag: '🇰🇷' },
    { name: 'Polish',     code: 'pl', flag: '🇵🇱' },
    { name: 'Portuguese', code: 'pt', flag: '🇵🇹' },
    { name: 'Romanian',   code: 'ro', flag: '🇷🇴' },
    { name: 'Russian',    code: 'ru', flag: '🇷🇺' },
    { name: 'Spanish',    code: 'es', flag: '🇪🇸' },
    { name: 'Swedish',    code: 'sv', flag: '🇸🇪' },
    { name: 'Thai',       code: 'th', flag: '🇹🇭' },
    { name: 'Turkish',    code: 'tr', flag: '🇹🇷' },
    { name: 'Ukrainian',  code: 'uk', flag: '🇺🇦' },
    { name: 'Vietnamese', code: 'vi', flag: '🇻🇳' },
];

const choices = LANGUAGES.map(l => ({
   name: `${l.flag} ${l.name}`,
    value: l.code
}));

async function getTranslatedText(text, sourceLanguageCode, targetLanguageCode = "en") {
    const parent = `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/global`;

    if (!sourceLanguageCode) {
        const [detection] = await translationClient.detectLanguage({
            parent,
            content: text,
            mimeType: "text/plain"
        });

        sourceLanguageCode = detection.languages?.[0]?.languageCode;
    }

    if (sourceLanguageCode === targetLanguageCode) {
        return {
            ok: false,
            response: "Source and target languages can't be the same."
        }
    }

    const request = {
        parent,
        contents: [text],
        mimeType: "text/plain",
        sourceLanguageCode: sourceLanguageCode,
        targetLanguageCode: targetLanguageCode ?? "en"
    };

    const [response] = await translationClient.translateText(request);

    return {
        ok: true,
        translatedText: response.translations[0]?.translatedText,
        sourceLanguageCode: sourceLanguageCode,
        targetLanguageCode: targetLanguageCode ?? "en",
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("translate")
        .setDescription("Translate text between languages")
        .addStringOption(option => option
            .setName("text")
            .setDescription("The text to translate")
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("from")
            .setDescription("The source language")
            .setRequired(false)
            .addChoices(...choices)
        )
        .addStringOption(option => option
            .setName("to")
            .setDescription("The target language")
            .setRequired(false)
            .addChoices(...choices)
        ),
    async execute(interaction) {
        const text = interaction.options.getString("text");
        const sourceLanguageCode = interaction.options.getString("from");
        const targetLanguageCode = interaction.options.getString("to");
        const translatedText = await getTranslatedText(text, sourceLanguageCode, targetLanguageCode);

        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(`${translatedText.translatedText}`)
            .addFields(
                { name: 'Source language', value: `${translatedText.sourceLanguageCode}`, inline: true },
                { name: 'Target language', value: `${translatedText.targetLanguageCode}`, inline: true }
            )
            .setFooter({
                text: 'Google Translate', iconURL: 'https://i.imgur.com/zm458qF.png',
            })
            .setColor('Blurple')

        try {
            await interaction.reply({
                embeds: [embed]
            });
        } catch (err) {
            console.error(err);
        }
    }
}