const fs = require("fs");
const path = require("path");

const welcomerDataFile = path.join(__dirname, "..", "data", "data/welcomer.json");
const antilinkDataFile = path.join(__dirname, "..", "data", "data/antilink.json");
const groupSettingsFile = path.join(__dirname, "..", "data", "data/groupSettings.json");

let welcomerData = fs.existsSync(welcomerDataFile) ? JSON.parse(fs.readFileSync(welcomerDataFile)) : { groups: {} };
let antilinkData = fs.existsSync(antilinkDataFile) ? JSON.parse(fs.readFileSync(antilinkDataFile)) : { groups: {} };
let groupSettings = fs.existsSync(groupSettingsFile) ? JSON.parse(fs.readFileSync(groupSettingsFile)) : { groups: {} };

module.exports = {
  name: "group",
  description: "Group related commands",
  async execute(sock, msg, groupId) {
    // Command: show group ID
    if (msg.body === "!groupid") {
      await sock.sendMessage(groupId, { text: `✅ This group ID is:\n${groupId}` });
    }
  },
};