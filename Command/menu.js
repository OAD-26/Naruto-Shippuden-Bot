const fs = require("fs");
const path = require("path");

module.exports = async (sock, from, msg, args) => {
  try {
    const avatarPath = path.join(__dirname, "../Assets/Naruto-Shippuden-Bot_Avatar.png");
    const settings = require('../index.js').settings || { prefix: '!', botName: 'Naruto-Shippuden-Bot', creatorName: 'OAD-26' };
    const prefix = settings.prefix;

    const categories = {
      "📜 S-Rank Scroll (Owner)": ["autoreact", "autotype", "autostatusview", "autostatuslike", "autoonline", "autowarn", "autoantiviewonce", "autodelete", "vv", "stopbot", "viewurl", "clearsession", "setbotname", "setbotpp", "setpp", "settings", "github"],
      "🍃 Leaf Village Laws (Admin)": ["kick", "ban", "mute", "promote", "demote", "hidetag", "tagall", "groupinteract"],
      "🌀 Shinobi Alliance (Group)": ["groupinfo", "groupadmins", "groupdesc", "groupinvite", "grouplist", "groupid"],
      "📚 Ninja Academy (Education)": ["wikipedia", "brainly", "translate", "calc", "dictionary"],
      "🍜 Ichiraku Ramen (General)": ["ping", "play", "joke", "quote", "weather", "news", "imagine", "lyrics"]
    };

    let menuText = `
🍥 *~ ${settings.botName} ~* 🍥
╔═══════════════════════════╗
  🌀 *NINJA SCROLL: MENU* 🌀
╚═══════════════════════════╝

👤 *Grandmaster:* ${settings.creatorName}
📜 *Prefix:* ${prefix}
⚡ *Chakra:* Online

`;

    for (const [category, cmds] of Object.entries(categories)) {
      menuText += `🌟 *${category}*\n┌───────────────────────────\n`;
      menuText += cmds.map(c => `│ 🌀 ${prefix}${c}`).join("\n") + "\n";
      menuText += `└───────────────────────────\n\n`;
    }

    menuText += `💡 *Ninja Tip:* Type commands with *${prefix}* prefix.\n🍥 *Believe it!* ⚡\n`;

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