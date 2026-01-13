const fs = require("fs");
const path = require("path");

const antilinkDataFile = path.join(__dirname, "..", "data", "antilink.json");
let antilinkData = fs.existsSync(antilinkDataFile) ? JSON.parse(fs.readFileSync(antilinkDataFile)) : { groups: {} };

module.exports = {
  name: "anti",
  description: "Anti-link command",
  async execute(sock, msg, groupId) {
    if (!antilinkData.groups[groupId]?.enabled) return;

    if (msg.body.includes("https://") || msg.body.includes("http://")) {
      const imagePath = path.join(__dirname, '../Assets/Naruto-Shippuden-Bot_Avatar.png');
      const warningText = "⚠️🚫📛 *Links are not allowed in this group!* ❌\n🍥 Dattebayo! Stay safe and follow the rules! 🔥";
      
      if (fs.existsSync(imagePath)) {
        await sock.sendMessage(groupId, { 
          image: fs.readFileSync(imagePath), 
          caption: warningText 
        });
      } else {
        await sock.sendMessage(groupId, { text: warningText });
      }
      await sock.sendMessage(groupId, { text: `🛑 Removing message from: ${msg.key.participant}` });
    }
  },
};
