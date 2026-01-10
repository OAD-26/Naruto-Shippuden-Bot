const fs = require("fs");
const path = require("path");

module.exports = async (sock, from, msg, args) => {
  try {
    const avatarPath = path.join(__dirname, "../Assets/Naruto-Shippuden-Bot_Avatar.png");

    // Section commands
    const ownerCommands = [
      "stopbot 🔥", 
      "viewurl 🌐", 
      "clearsession 🗑️", 
      "setbotname 📝", 
      "setbotpp 🖼️", 
      "setpp 🖼️", 
      "settings ⚙️", 
      "github 🛠️"
    ];

    const adminCommands = [
      "kick 👢", 
      "ban ⛔", 
      "mute 🔇", 
      "promote 🔱", 
      "demote 🏳️"
    ];

    const groupCommands = [
      "groupinfo 📊", 
      "groupadmins 👥", 
      "groupdesc 📜", 
      "groupinvite 🔗", 
      "groupinteract 🌀"
    ];

    const generalCommands = [
      "ping ⚡", 
      "play 🎵", 
      "joke 😂", 
      "quote 💬", 
      "weather ☁️", 
      "news 📰", 
      "translate 🌐"
    ];

    // Format function with Naruto style bullets
    const formatCommands = (title, cmds) => {
      return `\n🌟 *${title}*\n────────────────\n` + 
             cmds.map(c => `🌀 ${c}`).join("\n") + "\n";
    };

    const menuText = `
🍥 *~ Naruto Shippuden Bot ~* 🍥
─────────────────────────────
👤 Bot Owner: OAD-26
⚡ Prefix: !

${formatCommands("Owner Commands", ownerCommands)}
${formatCommands("Admin Commands", adminCommands)}
${formatCommands("Group Commands", groupCommands)}
${formatCommands("General Commands", generalCommands)}

💡 Type commands with *${'!'}* prefix.
🍥 Believe it! ⚡
─────────────────────────────
`;

    // Send menu with avatar if exists
    if (fs.existsSync(avatarPath)) {
      await sock.sendMessage(from, {
        image: fs.readFileSync(avatarPath),
        caption: menuText
      });
    } else {
      await sock.sendMessage(from, { text: menuText });
    }
  } catch (e) {
    console.error("❌ Menu command error:", e);
  }
};