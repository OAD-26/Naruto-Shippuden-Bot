const fs = require('fs');
const isOwnerOrSudo = require('../lib/isOwner');

const PMBLOCKER_PATH = './data/pmblocker.json';

function readState() {
    try {
        if (!fs.existsSync(PMBLOCKER_PATH)) return { enabled: false, message: '⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only.' };
        const raw = fs.readFileSync(PMBLOCKER_PATH, 'utf8');
        const data = JSON.parse(raw || '{}');
        return {
            enabled: !!data.enabled,
            message: typeof data.message === 'string' && data.message.trim() ? data.message : '⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only.'
        };
    } catch {
        return { enabled: false, message: '⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only.' };
    }
}

function writeState(enabled, message) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        const current = readState();
        const payload = {
            enabled: !!enabled,
            message: typeof message === 'string' && message.trim() ? message : current.message
        };
        fs.writeFileSync(PMBLOCKER_PATH, JSON.stringify(payload, null, 2));
    } catch {}
}

async function pmblockerCommand(sock, from, msg, args) {
    const senderId = message.key.participant || from;
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
    
    if (!message.key.fromMe && !isOwner) {
        await sock.sendMessage(from, { text: 'Only bot owner can use this command!' }, { quoted: msg });
        return;
    }
    
    const argStr = (args || '').trim();
    const [sub, ...rest] = argStr.split(' ');
    const state = readState();

    if (!sub || !['on', 'off', 'status', 'setmsg'].includes(sub.toLowerCase())) {
        await sock.sendMessage(from, { text: '*PMBLOCKER (Owner only)*\n\n.pmblocker on - Enable PM auto-block\n.pmblocker off - Disable PM blocker\n.pmblocker status - Show current status\n.pmblocker setmsg <text> - Set warning message' }, { quoted: msg });
        return;
    }

    if (sub.toLowerCase() === 'status') {
        await sock.sendMessage(from, { text: `PM Blocker is currently *${state.enabled ? 'ON' : 'OFF'}*\nMessage: ${state.message}` }, { quoted: msg });
        return;
    }

    if (sub.toLowerCase() === 'setmsg') {
        const newMsg = rest.join(' ').trim();
        if (!newMsg) {
            await sock.sendMessage(from, { text: 'Usage: .pmblocker setmsg <message>' }, { quoted: msg });
            return;
        }
        writeState(state.enabled, newMsg);
        await sock.sendMessage(from, { text: 'PM Blocker message updated.' }, { quoted: msg });
        return;
    }

    const enable = sub.toLowerCase() === 'on';
    writeState(enable);
    await sock.sendMessage(from, { text: `PM Blocker is now *${enable ? 'ENABLED' : 'DISABLED'}*.` }, { quoted: msg });
}

module.exports = { pmblockerCommand, readState };


