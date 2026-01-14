const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

async function getQuotedOrOwnImageUrl(sock, message) {
    // 1) Quoted image (highest priority)
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted?.imageMessage) {
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }

    // 2) Image in the current message
    if (message.message?.imageMessage) {
        const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }

    // 3) Mentioned or replied participant avatar
    let targetJid;
    const ctx = message.message?.extendedTextMessage?.contextInfo;
    if (ctx?.mentionedJid?.length > 0) {
        targetJid = ctx.mentionedJid[0];
    } else if (ctx?.participant) {
        targetJid = ctx.participant;
    } else {
        targetJid = message.key.participant || from;
    }

    try {
        const url = await sock.profilePictureUrl(targetJid, 'image');
        return url;
    } catch {
        return 'https://i.imgur.com/2wzGhpF.png';
    }
}

async function miscCommand(sock, from, msg, args) {
    try {
        const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
        const url = `https://api.some-random-api.com/canvas/misc/heart?avatar=${encodeURIComponent(avatarUrl)}`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        await sock.sendMessage(from, { image: Buffer.from(response.data) }, { quoted: msg });
    } catch (error) {
        console.error('Error in misc heart:', error);
        await sock.sendMessage(from, { text: '❌ Failed to create heart image. Try again later.' }, { quoted: msg });
    }
}

async function miscCommand(sock, from, msg, args) {
    const sub = (args[0] || '').toLowerCase();
    const rest = args.slice(1);

    async function simpleAvatarOnly(endpoint) {
        const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
        const url = `https://api.some-random-api.com/canvas/misc/${endpoint}?avatar=${encodeURIComponent(avatarUrl)}`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        await sock.sendMessage(from, { image: Buffer.from(response.data) }, { quoted: msg });
    }

    try {
        switch (sub) {
            case 'heart':
                await simpleAvatarOnly('heart');
                break;
            
            case 'horny':
                await simpleAvatarOnly('horny');
                break;
            case 'circle':
                await simpleAvatarOnly('circle');
                break;
            case 'lgbt':
                await simpleAvatarOnly('lgbt');
                break;
            case 'lied':
                await simpleAvatarOnly('lied');
                break;
            case 'lolice':
                await simpleAvatarOnly('lolice');
                break;
            case 'simpcard':
                await simpleAvatarOnly('simpcard');
                break;
            case 'tonikawa':
                await simpleAvatarOnly('tonikawa');
                break;

            case 'its-so-stupid': {
                const dog = rest.join(' ').trim();
                if (!dog) {
                    await sock.sendMessage(from, { text: 'Usage: .misc its-so-stupid <text>' }, { quoted: msg });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const url = `https://api.some-random-api.com/canvas/misc/its-so-stupid?dog=${encodeURIComponent(dog)}&avatar=${encodeURIComponent(avatarUrl)}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await sock.sendMessage(from, { image: Buffer.from(response.data) }, { quoted: msg });
                break;
            }

            case 'namecard': {
                // .misc namecard username|birthday|description(optional)
                const joined = rest.join(' ');
                const [username, birthday, description] = joined.split('|').map(s => (s || '').trim());
                if (!username || !birthday) {
                    await sock.sendMessage(from, { text: 'Usage: .misc namecard username|birthday|description(optional)' }, { quoted: msg });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const params = new URLSearchParams({ username, birthday, avatar: avatarUrl });
                if (description) params.append('description', description);
                const url = `https://api.some-random-api.com/canvas/misc/namecard?${params.toString()}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await sock.sendMessage(from, { image: Buffer.from(response.data) }, { quoted: msg });
                break;
            }

           
            case 'oogway':
            case 'oogway2': {
                const quote = rest.join(' ').trim();
                if (!quote) {
                    await sock.sendMessage(from, { text: `Usage: .misc ${sub} <quote>` }, { quoted: msg });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const url = `https://api.some-random-api.com/canvas/misc/${sub}?quote=${encodeURIComponent(quote)}&avatar=${encodeURIComponent(avatarUrl)}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await sock.sendMessage(from, { image: Buffer.from(response.data) }, { quoted: msg });
                break;
            }

            case 'tweet': {
                // .misc tweet displayname|username|comment|theme(optional: light/dark)
                const joined = rest.join(' ');
                const [displayname, username, comment, theme] = joined.split('|').map(s => (s || '').trim());
                if (!displayname || !username || !comment) {
                    await sock.sendMessage(from, { text: 'Usage: .misc tweet displayname|username|comment|theme(optional light/dark)' }, { quoted: msg });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const params = new URLSearchParams({ displayname, username, comment, avatar: avatarUrl });
                if (theme) params.append('theme', theme);
                const url = `https://api.some-random-api.com/canvas/misc/tweet?${params.toString()}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await sock.sendMessage(from, { image: Buffer.from(response.data) }, { quoted: msg });
                break;
            }

            case 'youtube-comment': {
                // .misc youtube-comment username|comment
                const joined = rest.join(' ');
                const [username, comment] = joined.split('|').map(s => (s || '').trim());
                if (!username || !comment) {
                    await sock.sendMessage(from, { text: 'Usage: .misc youtube-comment username|comment' }, { quoted: msg });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const params = new URLSearchParams({ username, comment, avatar: avatarUrl });
                const url = `https://api.some-random-api.com/canvas/misc/youtube-comment?${params.toString()}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await sock.sendMessage(from, { image: Buffer.from(response.data) }, { quoted: msg });
                break;
            }
            // Overlay endpoints
            case 'comrade':
            case 'gay':
            case 'glass':
            case 'jail':
            case 'passed':
            case 'triggered': {
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const overlay = sub; // same name for path
                const url = `https://api.some-random-api.com/canvas/overlay/${overlay}?avatar=${encodeURIComponent(avatarUrl)}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await sock.sendMessage(from, { image: Buffer.from(response.data) }, { quoted: msg });
                break;
            }

            default:
                await sock.sendMessage(from, { text: 'Usage: .misc <heart|horny|circle|lgbt|lesbian|nonbinary|pansexual|transgender|lied|lolice|simpcard|tonikawa|its-so-stupid <text>|namecard u|b|d?|nobitches <text>|oogway <q>|oogway2 <q>|tweet dn|un|c|theme?|youtube-comment un|c>' }, { quoted: msg });
                break;
        }
    } catch (error) {
        console.error('Error in misc command:', error);
        await sock.sendMessage(from, { text: '❌ Failed to generate image. Check your parameters and try again.' }, { quoted: msg });
    }
}

module.exports = { miscCommand, handleHeart };


