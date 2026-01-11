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
  publicUrl: "https://6209d386-490e-4795-800f-09aa5c093265-00-1kld4o4q4k4gz.picard.replit.dev/", // will ping self
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
console.log("Web server skipped for QR generation");

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
  const authPath = "./auth_info";
  if (!fs.existsSync(authPath)) fs.mkdirSync(authPath);

  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  console.log("🍥 *Initializing Shinobi Connection...* 🌀");
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Naruto-Shippuden-Bot", "Chrome", "121.0.6167.184"],
    markOnlineOnConnect: true,
    connectTimeoutMs: 120000,
    defaultQueryTimeoutMs: 120000,
    keepAliveIntervalMs: 30000,
    qrTimeout: 120000,
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(
        message.buttonsMessage ||
        message.templateMessage ||
        message.listMessage
      );
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              ...message,
            },
          },
        };
      }
      return message;
    },
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
        // Wait longer before reconnecting to allow system to settle
        const delay = reason === DisconnectReason.restartRequired ? 2000 : 10000;
        console.log(`🍥 Waiting ${delay/1000}s before reconnecting...`);
        setTimeout(startBot, delay);
      } else {
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
      const infoText = `🍥 *~ Naruto-Shippuden-Bot ~* 🍥\n─────────────────────────────\n👤 *Grandmaster:* ${settings.creatorName}\n📱 *Ninja Registry:* ${settings.creatorNumber}\n🤖 *Bot Identity:* ${settings.botName}\n👤 *Hokage (Owner):* ${sock.user.name || 'Shinobi'}\n📱 *Ninja Registry:* ${sock.user.id.split(':')[0]}\n─────────────────────────────\nWelcome to the Hidden Leaf! Use !menu to see all jutsu scrolls. 🌀`;
      
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