const { AttachmentBuilder } = require('discord.js');

async function renderLatex(response) {
    const text = await response.text();
    const lines = text.trim().split(/\r?\n/);

    if (lines[0] !== '0' || !lines[1]) return;

    return lines[1].split(' ')[0];
}

module.exports = {
    aliases: ['latex', 'lat'],
    name: 'tex',
    async execute(message, args) {
        if (!args) return;

        const body = new URLSearchParams({
            formula: `\\displaystyle ${args}`,
            fsize: "21px",
            fcolor: "c2c2c2",
            mode: "0",
            out: "1",
            remhost: "quicklatex.com",
            preamble: "\\usepackage{amsmath}\n\\usepackage{amsfonts}\n\\usepackage{amssymb}"
        });

        const request = await fetch("https://quicklatex.com/latex3.f", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        });

        const resultImage = await renderLatex(request);

        const file = new AttachmentBuilder(resultImage, {
            name: 'latex.png'
        });

        await message.reply({
            files: [file]
        });
    }
};
