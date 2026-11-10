const fs = require('fs');
const path = require('path');

/**
 * @param {import('../client')} client 
 */
module.exports = (client) => {
    const eventsPath = path.join(__dirname, '../events');

    if (!fs.existsSync(eventsPath)) {
        fs.mkdirSync(eventsPath, { recursive: true });
        return;
    }

    const readEvents = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                readEvents(fullPath);
            } else if (file.name.endsWith('.js')) {
                const event = require(fullPath);
                const eventName = event.name || file.name.replace('.js', '');

                if (event.once) {
                    client.once(eventName, (...args) => event.execute(...args, client));
                } else {
                    client.on(eventName, (...args) => event.execute(...args, client));
                }
                console.log(`Loaded event: ${eventName}`);
            }
        }
    };

    readEvents(eventsPath);
};
