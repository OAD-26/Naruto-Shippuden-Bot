const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

async function setGroupName(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        
        if (!isBotAdmin) {
            const imagePath = path.join(__dirname, '../Assets/Naruto-Shippuden-Bot_Avatar.png');
            const errorMessage = "🍥 *Dattebayo!* I can't do that if I'm not an admin! Please make me an admin first! 🔥";
            
            if (fs.existsSync(imagePath)) {
                await sock.sendMessage(chatId, { 
                    image: fs.readFileSync(imagePath), 
                    caption: errorMessage 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(chatId, { text: errorMessage });
            }
            return;
        }

        if (!isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '❌ Only group admins can use this command! 🛡️' }, { quoted: msg });
            return;
        }

        const newName = args.join(' ');
        if (!newName) {
            await sock.sendMessage(chatId, { text: '⚠️ Please provide a new name for the group! 📝' }, { quoted: msg });
            return;
        }

        await sock.groupUpdateSubject(chatId, newName);
        await sock.sendMessage(chatId, { text: `✅ Successfully updated group name to: *${newName}*! 🎊` }, { quoted: msg });

    } catch (error) {
        console.error('Error in setgname command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to update group name! 📛' });
    }
}

module.exports = setGroupName;
