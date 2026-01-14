const isAdmin = require('../lib/isAdmin');
const fs = require('fs');
const path = require('path');

async function kickCommand(sock, chatId, senderId, mentionedJids, message) {
    const isOwner = message.key.fromMe;
    if (!isOwner) {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            const imagePath = path.join(__dirname, '../Assets/Naruto-Shippuden-Bot_Avatar.png');
            const errorMessage = "🍥 *Dattebayo!* I can't do that if I'm not an admin! Please make me an admin first! 🔥";
            
            if (fs.existsSync(imagePath)) {
                await sock.sendMessage(from, { 
                    image: fs.readFileSync(imagePath), 
                    caption: errorMessage 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: errorMessage }, { quoted: msg });
            }
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(from, { text: 'Only group admins can use the kick command.' }, { quoted: msg });
            return;
        }
    }

    let usersToKick = [];
    
    if (mentionedJids && mentionedJids.length > 0) {
        usersToKick = mentionedJids;
    }
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        usersToKick = [message.message.extendedTextMessage.contextInfo.participant];
    }
    
    if (usersToKick.length === 0) {
        await sock.sendMessage(from, { 
            text: 'Please mention the user or reply to their message to kick!'
        }, { quoted: msg });
        return;
    }

    const botId = sock.user?.id || '';
    const botLid = sock.user?.lid || '';
    const botPhoneNumber = botId.includes(':') ? botId.split(':')[0] : (botId.includes('@') ? botId.split('@')[0] : botId);
    const botIdFormatted = botPhoneNumber + '@s.whatsapp.net';
    
    // Extract numeric part from bot LID (remove session identifier like :4)
    const botLidNumeric = botLid.includes(':') ? botLid.split(':')[0] : (botLid.includes('@') ? botLid.split('@')[0] : botLid);
    const botLidWithoutSuffix = botLid.includes('@') ? botLid.split('@')[0] : botLid;

    const metadata = await sock.groupMetadata(chatId);
    const participants = metadata.participants || [];

    const isTryingToKickBot = usersToKick.some(userId => {
        const userPhoneNumber = userId.includes(':') ? userId.split(':')[0] : (userId.includes('@') ? userId.split('@')[0] : userId);
        const userLidNumeric = userId.includes('@lid') ? userId.split('@')[0].split(':')[0] : '';
        
        // Direct match checks
        const directMatch = (
            userId === botId ||
            userId === botLid ||
            userId === botIdFormatted ||
            userPhoneNumber === botPhoneNumber ||
            (userLidNumeric && botLidNumeric && userLidNumeric === botLidNumeric)
        );
        
        if (directMatch) {
            return true;
        }
        
        // Check against participants
        const participantMatch = participants.some(p => {
            const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
            const pId = p.id ? p.id.split('@')[0] : '';
            const pLid = p.lid ? p.lid.split('@')[0] : '';
            const pFullId = p.id || '';
            const pFullLid = p.lid || '';
            
            // Extract numeric part from participant LID
            const pLidNumeric = pLid.includes(':') ? pLid.split(':')[0] : pLid;
            
            // Check if this participant is the bot
            const isThisParticipantBot = (
                pFullId === botId ||
                pFullLid === botLid ||
                pLidNumeric === botLidNumeric ||
                pPhoneNumber === botPhoneNumber ||
                pId === botPhoneNumber ||
                p.phoneNumber === botIdFormatted ||
                (botLid && pLid && botLidWithoutSuffix === pLid)
            );
            
            if (isThisParticipantBot) {
                // Check if the userId matches this bot participant
                return (
                    userId === pFullId ||
                    userId === pFullLid ||
                    userPhoneNumber === pPhoneNumber ||
                    userPhoneNumber === pId ||
                    userId === p.phoneNumber ||
                    (pLid && userLidNumeric && userLidNumeric === pLidNumeric) ||
                    (userLidNumeric && pLidNumeric && userLidNumeric === pLidNumeric)
                );
            }
            return false;
        });
        
        return participantMatch;
    });

    if (isTryingToKickBot) {
        await sock.sendMessage(from, { 
            text: "I can't kick myself🤖"
        }, { quoted: msg });
        return;
    }

    try {
        await sock.groupParticipantsUpdate(chatId, usersToKick, "remove");
        
        const usernames = await Promise.all(usersToKick.map(async jid => {
            return `@${jid.split('@')[0]}`;
        }));
        
        const imagePath = path.join(__dirname, '../Assets/Naruto-Shippuden-Bot_Avatar.png');
        const kickMessage = `${usernames.join(', ')} has been kicked successfully! 🍥 Dattebayo! 😤`;

        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(from, { 
                image: fs.readFileSync(imagePath), 
                caption: kickMessage,
                mentions: usersToKick
            });
        } else {
            await sock.sendMessage(from, { 
                text: kickMessage,
                mentions: usersToKick
            });
        }
    } catch (error) {
        console.error('Error in kick command:', error);
        await sock.sendMessage(from, { 
            text: 'Failed to kick user(s)!'
        });
    }
}

module.exports = kickCommand;
