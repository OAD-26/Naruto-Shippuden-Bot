
module.exports = async (sock, from, msg, args) => {
  const settings = require('../settings');
  const sender = from.includes("@s.whatsapp.net") ? from.split("@")[0] : from;
  const isOwner = sender === settings.creatorNumber;

  if (!isOwner) return sock.sendMessage(from, { text: "🚫 *Halt!* This command is for the *Hokage* only! 🌀" });

  const groupId = from.endsWith("@g.us") ? from : null;
  if (!groupId) return sock.sendMessage(from, { text: "🚫 This command works only in groups!" });

  const groupMeta = await sock.groupMetadata(groupId);
  const admins = groupMeta.participants.filter(p => p.admin).map(p => "@" + p.id.split("@")[0]);
  const status = args[0] && args[0].toLowerCase() === "on";

  // Update settings in memory
  settings.groupInteraction = settings.groupInteraction || {};
  settings.groupInteraction[groupId] = status;

  // Notification for the owner
  const ownerJid = settings.creatorNumber + "@s.whatsapp.net";
  const notification = `
🍥 *GROUP INTERACT UPDATE* 🌀
─────────────────────────────
🏘️ *Village:* ${groupMeta.subject}
🆔 *ID:* ${groupId}
👥 *Admins:* ${admins.join(", ")}
⚡ *Status:* ${status ? "ALLOWED" : "DISABLED"}
─────────────────────────────
*The Will of Fire is updated!* 🍃🔥`.trim();

  await sock.sendMessage(ownerJid, { 
    text: notification,
    mentions: groupMeta.participants.filter(p => p.admin).map(p => p.id)
  });

  // Silent confirmation in the group via reaction
  try {
    await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
  } catch (e) {}
};
