async function unmuteCommand(sock, chatId) {
    await sock.groupSettingUpdate(chatId, 'not_announcement'); // Unmute the group
    await sock.sendMessage(from, { text: 'The group has been unmuted.' });
}

module.exports = unmuteCommand;
