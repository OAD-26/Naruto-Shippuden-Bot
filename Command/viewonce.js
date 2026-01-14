const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function viewonceCommand(sock, from, msg, args) {
    // Extract quoted imageMessage or videoMessage from your structure
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedImage = quoted?.imageMessage;
    const quotedVideo = quoted?.videoMessage;

    if (quotedImage && quotedImage.viewOnce) {
        // Download and send the image
        const stream = await downloadContentFromMessage(quotedImage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(from, { image: buffer, fileName: 'media.jpg', caption: quotedImage.caption || '' }, { quoted: msg });
    } else if (quotedVideo && quotedVideo.viewOnce) {
        // Download and send the video
        const stream = await downloadContentFromMessage(quotedVideo, 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(from, { video: buffer, fileName: 'media.mp4', caption: quotedVideo.caption || '' }, { quoted: msg });
    } else {
        await sock.sendMessage(from, { text: '❌ Please reply to a view-once image or video.' }, { quoted: msg });
    }
}

module.exports = viewonceCommand; 