const fs = require('fs');
const path = require('path');

async function setBotName(sock, chatId, msg, args) {
    try {
        if (!msg.key.fromMe) {
            await sock.sendMessage(from, { text: '❌ This command is only available for the owner! 👑' });
            return;
        }

        const newName = args.join(' ');
        if (!newName) {
            await sock.sendMessage(from, { text: '⚠️ Please provide a new name for the bot! 🍥' });
            return;
        }

        // Note: Baileys doesn't have a direct "update bot name" for the account itself easily accessible
        // but we can update our local settings.
        const settingsPath = path.join(__dirname, '../settings.js');
        let settings = fs.readFileSync(settingsPath, 'utf8');
        settings = settings.replace(/botName:\s*".*?"/, `botName: "${newName}"`);
        fs.writeFileSync(settingsPath, settings);

        await sock.sendMessage(from, { text: `✅ Bot name updated to: *${newName}*! 🔥` }, { quoted: msg });

    } catch (error) {
        console.error('Error in setbotname command:', error);
        await sock.sendMessage(from, { text: '❌ Failed to update bot name! 📛' });
    }
}

module.exports = setBotName;
