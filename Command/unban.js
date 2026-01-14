const fs = require('fs');
const path = require('path');
const { channelInfo } = require('../lib/messageConfig');
const isAdmin = require('../lib/isAdmin');
const { isSudo } = require('../lib/index');

async function unbanCommand(sock, from, msg, args) {
    // Restrict in groups to admins; in private to owner/sudo
    const isGroup = chatId.endsWith('@g.us');
    if (isGroup) {
        const senderId = message.key.participant || from;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        if (!isBotAdmin) {
            await sock.sendMessage(from, { text: 'Please make the bot an admin to use .unban', ...channelInfo }, { quoted: msg });
            return;
        }
        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(from, { text: 'Only group admins can use .unban', ...channelInfo }, { quoted: msg });
            return;
        }
    } else {
        const senderId = message.key.participant || from;
        const senderIsSudo = await isSudo(senderId);
        if (!message.key.fromMe && !senderIsSudo) {
            await sock.sendMessage(from, { text: 'Only owner/sudo can use .unban in private chat', ...channelInfo }, { quoted: msg });
            return;
        }
    }
    let userToUnban;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToUnban = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToUnban) {
        await sock.sendMessage(from, { 
            text: 'Please mention the user or reply to their message to unban!', 
            ...channelInfo 
        }, { quoted: msg });
        return;
    }

    try {
        const bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json'));
        const index = bannedUsers.indexOf(userToUnban);
        if (index > -1) {
            bannedUsers.splice(index, 1);
            fs.writeFileSync('./data/banned.json', JSON.stringify(bannedUsers, null, 2));
            
            await sock.sendMessage(from, { 
                text: `Successfully unbanned ${userToUnban.split('@')[0]}!`,
                mentions: [userToUnban],
                ...channelInfo 
            });
        } else {
            await sock.sendMessage(from, { 
                text: `${userToUnban.split('@')[0]} is not banned!`,
                mentions: [userToUnban],
                ...channelInfo 
            });
        }
    } catch (error) {
        console.error('Error in unban command:', error);
        await sock.sendMessage(from, { text: 'Failed to unban user!', ...channelInfo }, { quoted: msg });
    }
}

module.exports = unbanCommand; 