module.exports = async (sock, from, msg, args) => {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;
    let text = "🍥 *ALL-VILLAGE SUMMONING!* 🌀\n\n" + (args.join(' ') || "") + "\n\n";
    participants.forEach(p => text += `@${p.id.split('@')[0]} `);
    await sock.sendMessage(from, { text: text.trim(), mentions: participants.map(p => p.id) });
};
