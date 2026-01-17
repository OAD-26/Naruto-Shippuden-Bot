
module.exports = async (sock, from, msg, args) => {
    const settings = require('../settings');
    const sender = from.includes("@s.whatsapp.net") ? from.split("@")[0] : from;
    const isOwner = sender === settings.creatorNumber;
    
    const groupMetadata = from.endsWith("@g.us") ? await sock.groupMetadata(from) : null;
    if (!groupMetadata) return sock.sendMessage(from, { text: "🚫 *Forbidden Jutsu!* This command only works in groups." });

    const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id.split("@")[0]);
    if (!admins.includes(sender) && !isOwner) {
        return sock.sendMessage(from, { text: "🚫 *Shadow Clone Jutsu Failed!* Only *Leaf Village Admins* can use this command! 🍃" });
    }

    const announcement = args.join(' ');
    if (!announcement) return sock.sendMessage(from, { text: "🍥 *Byakugan!* 🌀 Please provide a message for the announcement!" });

    const participants = groupMetadata.participants.map(p => p.id);
    
    const text = `
📜 *~ SHINOBI ANNOUNCEMENT ~* 🌀
─────────────────────────────
📢 *Message:* ${announcement}
─────────────────────────────
🍥 *~ ${settings.botName} ~* ⚡`.trim();

    await sock.sendMessage(from, { 
        text: text, 
        mentions: participants 
    });

    // Delete the triggering command message to keep it clean
    try {
        await sock.sendMessage(from, { delete: msg.key });
    } catch (e) {}
};
