// ===============================
// Naruto Shippuden 🍥 Group Interact Command
// ===============================

const fs = require("fs");
const path = require("path");

module.exports = async (sock, from, msg, args) => {
  try {
    // Only work in groups
    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, {
        text: "⚠️ This command can only be used in a group! 🍥"
      });
    }

    const sender = msg.key.participant || msg.key.remoteJid.split("@")[0];
    const ownerNumbers = require("../settings").ownerNumbers;

    if (!ownerNumbers.includes(sender)) {
      return await sock.sendMessage(from, {
        text: "🚫 Only the owner can toggle group interaction! 🍥"
      });
    }

    // Create data folder and file if not exist
    const dataDir = path.join(__dirname, "../data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    const filePath = path.join(dataDir, "groupinteract.json");
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "{}");

    let data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Toggle interaction
    const current = data[from] ?? false;
    data[from] = !current;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Fetch group metadata
    const groupMeta = await sock.groupMetadata(from);
    const groupName = groupMeta.subject;
    const admins = groupMeta.participants
      .filter((p) => p.admin)
      .map((a) => a.id.split("@")[0]);

    const statusText = data[from]
      ? `🍥 *Bot Interactions ENABLED* 🔥\nGroup: ${groupName}\nID: ${from}\nAdmins: ${admins.join(
          ", "
        )}`
      : `🍥 *Bot Interactions DISABLED* ⚡\nGroup: ${groupName}\nID: ${from}`;

    await sock.sendMessage(from, { text: statusText });
  } catch (err) {
    console.error("❌ groupinteract error:", err);
    await sock.sendMessage(from, { text: "⚠️ Something went wrong 🍥" });
  }
};