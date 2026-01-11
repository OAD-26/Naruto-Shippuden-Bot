const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'alive',
    description: 'Check if bot is alive',
    execute: async (sock, msg, text) => {
        const jid = msg.key.remoteJid;
        const imagePath = path.join(__dirname, '../Assets/Naruto-Shippuden-Bot_Avatar.png');
        const aliveMessage = '✅ *Naruto Bot* is alive and ready to serve! 🍥🔥 Believe it! 🤜🤛';

        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(jid, { 
                image: fs.readFileSync(imagePath), 
                caption: aliveMessage 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(jid, { text: aliveMessage }, { quoted: msg });
        }
    }
};
