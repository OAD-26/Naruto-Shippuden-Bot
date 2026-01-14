const isAdmin = require('../lib/isAdmin');

async function muteCommand(sock, chatId, senderId, message, durationInMinutes) {
    

    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
    if (!isBotAdmin) {
        await sock.sendMessage(from, { text: 'Please make the bot an admin first.' }, { quoted: msg });
        return;
    }

    if (!isSenderAdmin) {
        await sock.sendMessage(from, { text: 'Only group admins can use the mute command.' }, { quoted: msg });
        return;
    }

    try {
        // Mute the group
        await sock.groupSettingUpdate(chatId, 'announcement');
        
        if (durationInMinutes !== undefined && durationInMinutes > 0) {
            const durationInMilliseconds = durationInMinutes * 60 * 1000;
            await sock.sendMessage(from, { text: `The group has been muted for ${durationInMinutes} minutes.` }, { quoted: msg });
            
            // Set timeout to unmute after duration
            setTimeout(async () => {
                try {
                    await sock.groupSettingUpdate(chatId, 'not_announcement');
                    await sock.sendMessage(from, { text: 'The group has been unmuted.' });
                } catch (unmuteError) {
                    console.error('Error unmuting group:', unmuteError);
                }
            }, durationInMilliseconds);
        } else {
            await sock.sendMessage(from, { text: 'The group has been muted.' }, { quoted: msg });
        }
    } catch (error) {
        console.error('Error muting/unmuting the group:', error);
        await sock.sendMessage(from, { text: 'An error occurred while muting/unmuting the group. Please try again.' }, { quoted: msg });
    }
}

module.exports = muteCommand;
