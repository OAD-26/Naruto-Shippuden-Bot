const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');


async function githubCommand(sock, from, msg, args) {
  try {
    const res = await fetch('https://api.github.com/repos/mruniquehacker/Knightbot-md');
    if (!res.ok) throw new Error('Error fetching repository data');
    const json = await res.json();

    let txt = `*乂  Naruto-Shippuden-Bot  乂*\n\n`;
    txt += `✩  *Name* : ${json.name}\n`;
    txt += `✩  *Watchers* : ${json.watchers_count}\n`;
    txt += `✩  *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
    txt += `✩  *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
    txt += `✩  *URL* : ${json.html_url}\n`;
    txt += `✩  *Forks* : ${json.forks_count}\n`;
    txt += `✩  *Stars* : ${json.stargazers_count}\n\n`;
    txt += `💥 *Naruto-Shippuden-Bot*`;

    // Use the local asset image
    const imgPath = path.join(__dirname, '../Assets/Naruto-Shippuden-Bot_Avatar.png');
    const imgBuffer = fs.readFileSync(imgPath);

    await sock.sendMessage(from, { image: imgBuffer, caption: txt }, { quoted: msg });
  } catch (error) {
    await sock.sendMessage(from, { text: '❌ Error fetching repository information.' }, { quoted: msg });
  }
}

module.exports = githubCommand; 