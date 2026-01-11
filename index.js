// ===============================
// Naruto Shippuden Bot 🍥 FULL INDEX
// ===============================

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const pino = require("pino");
const express = require("express");
const axios = require("axios");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

// ===============================
// 🔥 SETTINGS
// ===============================
const settings = {
  botName: "Naruto-Shippuden-Bot",
  prefix: "!",
  creatorName: "OAD-26",
  creatorNumber: "2349138385352",
  publicUrl: "https://YOUR-REPLIT-URL-HERE/", // will ping self
  ownerCommands: ["setbotname","setpp","setbotpp","settings","github"], // Owner only
  adminCommands: ["ban","kick","promote","demote","groupinfo"], // Admins only
  everyoneCommands: [], // Fun commands etc. loaded automatically
  groupInteraction: {}, // Stores group interact status {groupJID:true/false}
};

// ===============================
// 🌐 WEB SERVER
// ===============================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.status(200).send("🍥 Naruto Shippuden Bot is Alive & Breathing Chakra 🔥");
});
app.listen(PORT, "0.0.0.0", () => console.log(`🌐 Web server running on port ${PORT}`));

// Self ping to stay alive
setInterval(async () => {
  try { await axios.get(settings.publicUrl); } catch {}
}, 5 * 60 * 1000);

// ===============================
// 📱 TERMINAL INPUT
// ===============================
function askNumber() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question("📱 Enter WhatsApp number to pair (country code, no +): ", num => {
      rl.close();
      resolve(num.replace(/\D/g,""));
    });
  });
}

// ===============================
// 🍥 START BOT
// ===============================
async function startBot() {
  if (!fs.existsSync("./auth_info")) fs.mkdirSync("./auth_info");

  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");
  const sock = makeWASocket({
    logger: pino({ level:"silent" }),
    auth: state,
    browser: ["Naruto-Shippuden-Bot","Safari","3.0.0"],
    markOnlineOnConnect: true
  });

  const qrcode = require("qrcode-terminal");
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log("🍥 Scan the QR Code below to connect Naruto-Shippuden-Bot! 🔥");
      qrcode.generate(qr, { small: true });
    }
    
    if(connection === "open") {
      console.log("✅ Naruto-Shippuden-Bot connected!");
      heartbeat = setInterval(async () => { try { await sock.sendPresenceUpdate("available"); } catch{} }, 10*60*1000);
      
      // Auto message to Creator
      const creatorJid = settings.creatorNumber + "@s.whatsapp.net";
      const ownerName = sock.user.name || "Unknown";
      const ownerNumber = sock.user.id.split(":")[0];
      await sock.sendMessage(creatorJid, { 
        text: `🍥 *Naruto-Shippuden-Bot* is Online!\n\n👤 *Owner:* ${ownerName}\n📱 *Number:* ${ownerNumber}\n🌀 Believe it! ⚡`
      });
    }
    if(connection === "close") {
      if(heartbeat) clearInterval(heartbeat);
      const reason = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = reason !== DisconnectReason.loggedOut;
      console.log("❌ Disconnected:", reason, "| Reconnecting:", shouldReconnect);
      if(shouldReconnect) startBot();
      else {
        console.log("🚫 Logged out — deleting auth_info and restarting...");
        fs.rmSync("./auth_info", { recursive: true, force: true });
        setTimeout(startBot, 5000);
      }
    }
  });

  // ===============================
  // 📩 MESSAGE HANDLER
  // ===============================
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if(!msg.message) return;

    const from = msg.key.remoteJid;
    const type = Object.keys(msg.message)[0];
    let text = "";
    if(type === "conversation") text = msg.message.conversation;
    else if(type === "extendedTextMessage") text = msg.message.extendedTextMessage.text;
    text = String(text || "");

    if(!text.startsWith(settings.prefix)) return;

    const args = text.slice(settings.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const sender = from.includes("@s.whatsapp.net") ? from.split("@")[0] : from;

    const isOwner = sender === settings.creatorNumber;
    const groupId = from.endsWith("@g.us") ? from : null;
    const groupAllowed = groupId ? settings.groupInteraction[groupId] : true;

    // ===============================
    // Group interact check
    if(groupId && !groupAllowed && !isOwner) return;

    // Load commands dynamically
    const commandPath = path.join(__dirname,"Command",`${commandName}.js`);
    if(!fs.existsSync(commandPath)) return;

    // Send auto message to Owner on first usage
    if (!settings.ownerMessaged) {
      const avatarPath = path.join(__dirname, "Assets/Naruto-Shippuden-Bot_Avatar.png");
      const infoText = `🍥 *~ Naruto-Shippuden-Bot ~* 🍥\n─────────────────────────────\n👤 *Creator:* ${settings.creatorName}\n📱 *Creator No:* ${settings.creatorNumber}\n🤖 *Bot Name:* ${settings.botName}\n👤 *Owner:* ${sock.user.name || 'User'}\n📱 *Owner No:* ${sock.user.id.split(':')[0]}\n─────────────────────────────\nWelcome! Use !menu to see all commands. 🌀`;
      
      if (fs.existsSync(avatarPath)) {
        await sock.sendMessage(from, { image: fs.readFileSync(avatarPath), caption: infoText });
      } else {
        await sock.sendMessage(from, { text: infoText });
      }
      settings.ownerMessaged = true;
    }

    try {
      delete require.cache[require.resolve(commandPath)];
      const commandFile = require(commandPath);

      // Permissions
      if(settings.ownerCommands.includes(commandName) && !isOwner) return await sock.sendMessage(from,{text:"🚫 Owner only command!"});
      if(settings.adminCommands.includes(commandName) && !isOwner) {
        const groupMeta = groupId ? await sock.groupMetadata(groupId) : null;
        const admins = groupMeta?.participants?.filter(p=>p.admin)?.map(p=>p.id.split("@")[0]) || [];
        if(!admins.includes(sender)) return;
      }

      // Execute command
      if(typeof commandFile==="function") await commandFile(sock, from, msg, args);
      else if(commandFile && typeof commandFile.execute==="function") await commandFile.execute(sock, from, msg, args);

    } catch(e){ console.error("❌ Error executing command:", commandName,e); }
  });

  // ===============================
  // 🟢 GROUP INTERACT COMMAND (Owner Only)
  const groupInteractPath = path.join(__dirname,"Command","groupinteract.js");
  if(!fs.existsSync(groupInteractPath)) {
    fs.writeFileSync(groupInteractPath, `
module.exports = async (sock, from, msg, args) => {
  const groupId = msg.key.remoteJid;
  if(!groupId.endsWith("@g.us")) return sock.sendMessage(from,{text:"🚫 This command works only in groups!"});
  const groupMeta = await sock.groupMetadata(groupId);
  const admins = groupMeta.participants.filter(p=>p.admin).map(p=>p.id.split("@")[0]);
  const status = args[0] && args[0].toLowerCase() === "on";
  require('../index.js').settings.groupInteraction[groupId] = status;
  await sock.sendMessage(from,{
    text: \`🍥 Bot Interactions \${status?"Allowed":"Disabled"} in *\${groupMeta.subject}* 🌀\\nAdmins: \${admins.join(", ")}\`
  });
};
    `);
  }

  console.log("🟢 Naruto Shippuden Bot ready with Group Interact & Permissions!");
}

// ===============================
// ▶️ RUN
// ===============================
startBot();