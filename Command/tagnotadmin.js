const isAdmin = require('../lib/isAdmin');

async function tagNotAdminCommand(sock, chatId, senderId, message) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(from, { text: 'Please make the bot an admin first.' }, { quoted: msg });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(from, { text: 'Only admins can use the .tagnotadmin command.' }, { quoted: msg });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];

        const nonAdmins = participants.filter(p => !p.admin).map(p => p.id);
        if (nonAdmins.length === 0) {
            await sock.sendMessage(from, { text: 'No non-admin members to tag.' }, { quoted: msg });
            return;
        }

        let text = '🔊 *Hello Everyone:*\n\n';
        nonAdmins.forEach(jid => {
            text += `@${jid.split('@')[0]}\n`;
        });

        await sock.sendMessage(from, { text, mentions: nonAdmins }, { quoted: msg });
    } catch (error) {
        console.error('Error in tagnotadmin command:', error);
        await sock.sendMessage(from, { text: 'Failed to tag non-admin members.' }, { quoted: msg });
    }
}

module.exports = tagNotAdminCommand;


