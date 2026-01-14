const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

async function setGroupName(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || from;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        
        if (!isBotAdmin) {
            const imagePath = path.join(__dirname, '../Assets/Naruto-Shippuden-Bot_Avatar.png');
            const errorMessage = "🍥 *Dattebayo!* I can't do that if I'm not an admin! Please make me an admin first! 🔥";
            
            if (fs.existsSync(imagePath)) {
                await sock.sendMessage(from, { 
                    image: fs.readFileSync(imagePath), 
                    caption: errorMessage 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: errorMessage });
            }
            return;
        }

        if (!isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(from, { text: '❌ Only group admins can use this command! 🛡️' }, { quoted: msg });
            return;
        }

        const newName = args.join(' ');
        if (!newName) {
            await sock.sendMessage(from, { text: '⚠️ Please provide a new name for the group! 📝' }, { quoted: msg });
            return;
        }

        await sock.groupUpdateSubject(chatId, newName);
        await sock.sendMessage(from, { text: `✅ Successfully updated group name to: *${newName}*! 🎊` }, { quoted: msg });

    } catch (error) {
        console.error('Error in setgname command:', error);
        await sock.sendMessage(from, { text: '❌ Failed to update group name! 📛' });
    }
}

module.exports = setGroupName;
