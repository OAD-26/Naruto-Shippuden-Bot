const os = require('os');
const settings = require('../settings');
const fs = require('fs');
const path = require('path');

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

async function pingCommand(sock, from, msg, args) {
    try {
        const imagePath = path.join(__dirname, '../Assets/Naruto-Shippuden-Bot_Avatar.png');
        const start = Date.now();
        
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(from, { 
                video: fs.readFileSync(imagePath), 
                gifPlayback: true, 
                caption: 'Pong!' 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: 'Pong!' }, { quoted: msg });
        }

        const end = Date.now();
        const ping = Math.round((end - start) / 2);

        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatTime(uptimeInSeconds);

        const botInfo = `
┏━━〔 🤖 Naruto-Shippuden-Bot 〕━━┓
┃ 🚀 Ping     : ${ping} ms
┃ ⏱️ Uptime   : ${uptimeFormatted}
┃ 🔖 Version  : v${settings.version}
┗━━━━━━━━━━━━━━━━━━━┛`.trim();

        await sock.sendMessage(from, { text: botInfo},{ quoted: msg });

    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(from, { text: '❌ Failed to get bot status.' });
    }
}

module.exports = pingCommand;
