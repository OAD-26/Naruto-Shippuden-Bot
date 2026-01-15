module.exports = async (sock, from, msg, args) => {
    const settings = require('../settings');
    const sender = from.includes("@s.whatsapp.net") ? from.split("@")[0] : from;
    if (sender !== settings.creatorNumber) return sock.sendMessage(from, { text: "🚫 *Halt!* This jutsu is for the *Hokage* only! 🌀" });

    const status = args[0] && args[0].toLowerCase() === "on";
    settings.autoConfig = settings.autoConfig || {};
    settings.autoConfig['${cmd}'] = status;

    const notification = `
🍥 *NINJA SETTING UPDATE* 🌀
─────────────────────────────
⚡ *Jutsu:* ${cmd.toUpperCase()}
📜 *Status:* ${status ? "ACTIVATED" : "DEACTIVATED"}
─────────────────────────────
*Believe it!* 🍃🔥`.trim();

    await sock.sendMessage(from, { text: notification }, { quoted: msg });
};
