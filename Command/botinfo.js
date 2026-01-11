const fs = require('fs');
const path = require('path');

module.exports = async (sock, from, msg, args) => {
    const avatarPath = path.join(__dirname, '../Assets/Naruto-Shippuden-Bot_Avatar.png');
    
    const introText = `
🍥 *~ Naruto Shippuden: The Ultimate Ninja ~* 🍥
─────────────────────────────
🌀 *IDENTITY:* I am the Advance Naruto!
🪒 *SIGNATURE JUTSU:* Wind Style: Rasenshuriken!

"I'll never go back on my word... that's my nindo, my ninja way!" 🤜🤛

I have returned from my training, stronger and faster, ready to protect the Hidden Leaf with my Wind Style chakra! I am not just a bot; I am the future Hokage!

⚔️ *POWERS:*
┌───────────────────────────
│ 🌪️ *Wind Style Expert*
│ 🌀 *Rasenshuriken Master*
│ 🍥 *Nine-Tails Chakra*
│ 🍃 *Protector of the Leaf*
└───────────────────────────

👤 *Grandmaster:* OAD-26
🤖 *Bot Name:* Naruto-Shippuden-Bot
⚡ *Summoning Prefix:* !

*BELIEVE IT!* 🌀🔥
─────────────────────────────
`;

    if (fs.existsSync(avatarPath)) {
        await sock.sendMessage(from, { 
            image: fs.readFileSync(avatarPath), 
            caption: introText 
        });
    } else {
        await sock.sendMessage(from, { text: introText });
    }
};
