const axios = require('axios');
const { fetchBuffer } = require('../lib/myfunc');

async function imagineCommand(sock, from, msg, args) {
    try {
        const text = args.join(' ');
        
        if (!text) {
            return await sock.sendMessage(from, {
                text: '🍥 *KUCHIYOSE NO JUTSU!* 🌀\n\nI need a prompt to manifest your vision, shinobi! \nExample: `!imagine a fierce battle between Naruto and Sasuke` or `!imagine video of a dragon flying`'
            }, { quoted: msg });
        }

        const videoKeywords = ['video', 'motion', 'moving', 'clip', 'animation', 'animated', 'live', 'movie', 'film'];
        const isVideo = videoKeywords.some(keyword => text.toLowerCase().includes(keyword));
        
        await sock.sendMessage(from, {
            text: `🍥 *Chakra focus initiated...* 🌀\n\nManifesting your ${isVideo ? 'video' : 'image'} through the *Summoning Jutsu*! Please wait...`
        }, { quoted: msg });

        if (isVideo) {
            // Video Generation using alternative Shizo/ZELL API endpoints
            const videoPrompt = text.replace(new RegExp(videoKeywords.join('|'), 'gi'), '').trim();
            
            // Backup API system
            const apiEndpoints = [
                `https://shizoapi.onrender.com/api/ai/z-imagine-video?apikey=shizo&query=${encodeURIComponent(videoPrompt)}`,
                `https://shizoapi.onrender.com/api/ai/imagine-video?apikey=shizo&query=${encodeURIComponent(videoPrompt)}`,
                `https://shizoapi.onrender.com/api/ai/motion-video?apikey=shizo&query=${encodeURIComponent(videoPrompt)}`
            ];

            let videoBuffer = null;
            let finalVideoPrompt = videoPrompt;

            for (const apiUrl of apiEndpoints) {
                try {
                    const response = await axios.get(apiUrl);
                    if (response.data && (response.data.result || response.data.url)) {
                        const videoUrl = response.data.result || response.data.url;
                        videoBuffer = await fetchBuffer(videoUrl, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                                'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
                                'Referer': 'https://shizoapi.onrender.com/'
                            }
                        });
                        if (Buffer.isBuffer(videoBuffer) && videoBuffer.length > 1024) break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!videoBuffer || videoBuffer.length < 1024) {
                throw new Error('All Video Summoning scrolls failed! Chakra depletion.');
            }
            
            await sock.sendMessage(from, {
                video: videoBuffer,
                caption: `🍥 *JUTSU SUCCESS!* 🌀\n\n🎞️ *Video Scroll:* "${videoPrompt}"\n⚡ *Powered by Wind Style: Rasenshuriken!* \n\n*Believe it!* 🤜🤛`,
                mimetype: 'video/mp4',
                fileName: `Naruto_Scroll_${Date.now()}.mp4`
            }, { quoted: msg });
        } else {
            // Image Generation
            const enhancedPrompt = `${text}, high quality, detailed, masterpiece, 4k, cinematic lighting`;
            const apiUrl = `https://shizoapi.onrender.com/api/ai/imagine?apikey=shizo&query=${encodeURIComponent(enhancedPrompt)}`;
            
            const imageBuffer = await fetchBuffer(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'image/png,image/jpeg,image/*;q=0.9,*/*;q=0.8'
                }
            });

            // Lowered threshold to 10kb for images
            if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length < 10240) {
                throw new Error('Image scroll is too thin! Chakra depletion (Buffer < 10kb)');
            }
            
            await sock.sendMessage(from, {
                image: imageBuffer,
                caption: `🍥 *JUTSU SUCCESS!* 🌀\n\n🖼️ *Image Scroll:* "${text}"\n⚡ *Mastered by the Seventh Hokage!* \n\n*Believe it!* 🤜🤛`
            }, { quoted: msg });
        }

    } catch (error) {
        console.error('Error in imagine command:', error);
        await sock.sendMessage(from, {
            text: '❌ *Jutsu Interrupted!* 🌀\n\nMy chakra flow was disturbed. Please try again later, shinobi!'
        }, { quoted: msg });
    }
}

module.exports = imagineCommand;
