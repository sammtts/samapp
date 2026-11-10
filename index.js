const Bot = require('./src/client');
require('dotenv').config();

const client = new Bot();

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
    console.error('Caught exception:', err, 'Origin:', origin);
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
    process.exit(1);
}

client.init(token);
