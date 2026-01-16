module.exports = async (sock, from, msg, args) => {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants.map(p => p.id);
    const text = args.join(' ') || "🍥 *ATTENTION SHINOBI!* 🌀";
    await sock.sendMessage(from, { text, mentions: participants });
};
