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
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

// ===============================
// 🔥 SETTINGS
// ===============================
const settings = require('./settings');
settings.publicUrl = "https://58dc470e-9993-464f-9067-10f29b4d8f84-00-hi0ncdhkg69i.worf.replit.dev/";
settings.ownerCommands = ["setbotname","setpp","setbotpp","settings","github", "autoreact", "autotype", "autostatusview", "autostatuslike", "autoonline", "autowarn", "autoantiviewonce", "autodelete", "vv"];
settings.adminCommands = ["ban","kick","promote","demote","groupinfo"];
settings.everyoneCommands = [];
settings.groupInteraction = {};

// Auto-config state
settings.autoConfig = {
    autoreact: false,
    autotype: false,
    autostatusview: false,
    autostatuslike: false,
    autoonline: false,
    autowarn: false,
    autoantiviewonce: false,
    autodelete: false,
    vv: false
};

// ===============================
// 🌐 WEB SERVER
// ===============================
const app = express();
const PORT = process.env.PORT || 5000;

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
    const authPath = path.join(process.cwd(), "auth_info");
    if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    console.log("🍥 *Initializing Shinobi Connection...* 🌀");
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`🍥 *Using WA Version:* ${version.join(".")} (Latest: ${isLatest}) 🌀`);

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ["Naruto-Shippuden-Bot", "Chrome", "1.0.0"],
        printQRInTerminal: true,
        markOnlineOnConnect: true,
        generateHighQualityLink: true,
        getMessage: async (key) => {
            return {
                conversation: "🍥 Naruto Shippuden Bot - Believe it! ⚡"
            };
        }
    });

  const qrcode = require("qrcode-terminal");
  let heartbeat;

  sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log("\n🍥 *The Scroll of Connection* has appeared! 🌀");
            console.log("🔥 Scan the QR Code below to enter the Hidden Leaf! 🔥\n");
            qrcode.generate(qr, { small: true });
        } else if (connection === "connecting") {
            console.log("🍥 *The Shinobi is preparing for the mission...* 🌀");
        }
        
        if (connection === "open") {
            console.log("✅ *Naruto-Shippuden-Bot* has entered the battlefield! 🌀");
            heartbeat = setInterval(async () => { try { await sock.sendPresenceUpdate("available"); } catch{} }, 10*60*1000);
            
            // Auto message to Creator
            const creatorJid = settings.creatorNumber + "@s.whatsapp.net";
            const ownerName = sock.user.name || "Shinobi";
            const ownerNumber = sock.user.id.split(":")[0];
            await sock.sendMessage(creatorJid, { 
                text: `🍥 *Naruto-Shippuden-Bot* is Online! 🌀\n\n👤 *Hokage (Owner):* ${ownerName}\n📱 *Ninja Registry:* ${ownerNumber}\n⚡ *Status:* Ready for Mission!\n\n🌀 *Believe it!* ⚡`
            });
        }
        if(connection === "close") {
            if(heartbeat) clearInterval(heartbeat);
            const reason = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = reason !== DisconnectReason.loggedOut;
            
            console.log("❌ Disconnected:", reason, "| Reconnecting:", shouldReconnect);
            
            if(shouldReconnect) {
                const delay = reason === DisconnectReason.restartRequired ? 2000 : 10000;
                console.log(`🍥 Waiting ${delay/1000}s before reconnecting...`);
                setTimeout(startBot, delay);
            } else {
                console.log("🚫 Logged out — deleting auth_info and restarting...");
                fs.rmSync(authPath, { recursive: true, force: true });
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

    // Autoonline logic
    if (settings.autoConfig.autoonline) {
        await sock.sendPresenceUpdate("available");
    }

    // Autotype logic
    if (settings.autoConfig.autotype) {
        await sock.sendPresenceUpdate("composing", msg.key.remoteJid);
    }

    // Autoreact logic
    if (settings.autoConfig.autoreact && !msg.key.fromMe) {
        const reactions = ["🍥", "🌀", "🔥", "🍃", "⚡", "🤜", "🤛"];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        await sock.sendMessage(msg.key.remoteJid, { react: { text: randomReaction, key: msg.key } });
    }

    // Auto-antiviewonce / VV logic
    const viewOnceType = msg.message.viewOnceMessageV2 || msg.message.viewOnceMessage || msg.message.viewOnceMessageV2Extension;
    if (viewOnceType && (settings.autoConfig.autoantiviewonce || settings.autoConfig.vv)) {
        const actualMsg = viewOnceType.message;
        const ownerJid = settings.creatorNumber + "@s.whatsapp.net";
        
        if (settings.autoConfig.vv) {
            await sock.sendMessage(ownerJid, { text: "🍥 *BYAKUGAN!* 🌀\nView-once detected. Manifesting in your DM..." });
            await sock.copyNForward(ownerJid, msg, true);
        }
        
        if (settings.autoConfig.autoantiviewonce && msg.key.remoteJid.endsWith("@g.us")) {
            await sock.copyNForward(msg.key.remoteJid, msg, true);
        }
    }

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
    const commandPath = path.join(process.cwd(),"Command",`${commandName}.js`);
    if(!fs.existsSync(commandPath)) {
      return await sock.sendMessage(from, { 
        text: `🚫 *Forbidden Jutsu Error!* 🌀\n\nCommand *!${commandName}* is not found in the Hidden Leaf scrolls! Check your spelling or use *!menu* to see available jutsu! 🍃`
      });
    }

    try {
      delete require.cache[require.resolve(commandPath)];
      const commandFile = require(commandPath);

      // Permissions
      if(settings.ownerCommands.includes(commandName) && !isOwner) return await sock.sendMessage(from,{text:"🚫 *Halt!* This jutsu is reserved for the *Creator* only! 🌀"});
      if(settings.adminCommands.includes(commandName) && !isOwner) {
        const groupMeta = groupId ? await sock.groupMetadata(groupId) : null;
        const admins = groupMeta?.participants?.filter(p=>p.admin)?.map(p=>p.id.split("@")[0]) || [];
        if(!admins.includes(sender)) return await sock.sendMessage(from,{text:"🚫 *Shadow Clone Jutsu Failed!* Only *Leaf Village Admins* can use this command! 🍃"});
      }

      // Execute command
      if(typeof commandFile==="function") await commandFile(sock, from, msg, args);
      else if(commandFile && typeof commandFile.execute==="function") await commandFile.execute(sock, from, msg, args);

    } catch(e){ console.error("❌ Error executing command:", commandName,e); }
  });

  // ===============================
  // 🟢 GROUP INTERACT COMMAND (Owner Only)
  const groupInteractPath = path.join(process.cwd(),"Command","groupinteract.js");
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