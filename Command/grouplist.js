const moment = require('moment-timezone');

async function grouplistCommand(sock, from, msg, args) {
    try {
        const settings = require('../settings');
        const sender = from.includes("@s.whatsapp.net") ? from.split("@")[0] : from;
        const isOwner = sender === settings.creatorNumber;

        if (!isOwner) {
            return await sock.sendMessage(from, { 
                text: "🚫 *Halt!* This top-secret intelligence scroll is reserved for the *Hokage* (Owner) only! 🌀" 
            }, { quoted: msg });
        }

        // Send loading message
        await sock.sendMessage(from, { 
            text: "🍥 *Byakugan!* 🌀\n\n_Scanning the ninja registries for all associated villages..._" 
        }, { quoted: msg });

        const getGroups = await sock.groupFetchAllParticipating();
        const groups = Object.values(getGroups);

        if (groups.length === 0) {
            return await sock.sendMessage(from, { 
                text: "🍃 *Hidden Leaf Intelligence:* You haven't joined any ninja squads yet! 🌀" 
            }, { quoted: msg });
        }

        // Sort alphabetically
        groups.sort((a, b) => a.subject.localeCompare(b.subject));

        let listText = `🍥 *HOKAGE'S SQUAD REGISTRY* 🌀\n\n`;
        listText += `Total squads found: *${groups.length}*\n─────────────────────────────\n\n`;

        groups.forEach((group, index) => {
            // Baileys doesn't reliably store "join date", so we use creation date as a fallback if available
            // or just list the squad info.
            const creationDate = group.creation ? moment(group.creation * 1000).tz('Africa/Lagos').format('DD/MM/YYYY') : 'Unknown Date';
            const creationTime = group.creation ? moment(group.creation * 1000).tz('Africa/Lagos').format('HH:mm:ss') : 'Unknown Time';
            
            listText += `${index + 1}. 🏘️ *Village:* ${group.subject}\n`;
            listText += `   🆔 *ID:* ${group.id}\n`;
            listText += `   📅 *Established:* ${creationDate}\n`;
            listText += `   ⌚ *Time:* ${creationTime}\n`;
            listText += `   👥 *Shinobi Count:* ${group.participants.length}\n`;
            listText += `─────────────────────────────\n`;
        });

        listText += `\n*The Will of Fire burns in all squads!* 🍃🔥`;

        await sock.sendMessage(from, { text: listText }, { quoted: msg });

    } catch (error) {
        console.error('Error in grouplist command:', error);
        await sock.sendMessage(from, { 
            text: "💥 *Jutsu Failed!* 🌀\n\nSomething interfered with the Byakugan scan. Try again later!" 
        }, { quoted: msg });
    }
}

module.exports = grouplistCommand;
