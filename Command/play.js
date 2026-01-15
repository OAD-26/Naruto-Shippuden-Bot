const yts = require('yt-search');
const axios = require('axios');
const { ytmp3 } = require('ruhend-scraper');

async function playCommand(sock, from, msg, args) {
    try {
        const searchQuery = args.join(' ');
        
        if (!searchQuery) {
            return await sock.sendMessage(from, { 
                text: "🍥 *Kage Bunshin no Jutsu!* 🌀\n\nPlease provide a song name to search, shinobi!"
            });
        }

        // Search for the song
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            return await sock.sendMessage(from, { 
                text: "🚫 *Shadow Clone Jutsu Failed!* 🌀\n\nNo songs found in the Hidden Leaf scrolls!"
            });
        }

        const bestResult = videos[0];
        const urlYt = bestResult.url;
        const title = bestResult.title;

        // Send detailed message first
        const infoMessage = `
🍥 *MUSIC SUMMONING SUCCESS!* 🌀
─────────────────────────────
🎵 *Title:* ${title}
👤 *Platform:* YouTube/Ruhend
🌐 *Source:* ${urlYt}
⚡ *Status:* Delivering Chakra...
─────────────────────────────
*Believe it!* 🤜🤛`.trim();

        await sock.sendMessage(from, { text: infoMessage }, { quoted: msg });

        let audioUrl = null;

        // 1. Try Ruhend Scraper (Very high reliability)
        try {
            const res = await ytmp3(urlYt);
            if (res && res.url) {
                audioUrl = res.url;
            } else if (res && res.download) {
                audioUrl = res.download;
            }
        } catch (e) {
            console.log("Ruhend Scraper Failed");
        }

        // 2. Fallback to Multi-API system
        if (!audioUrl) {
            const apis = [
                `https://api.shizocore.xyz/api/download/ytmp3?url=${encodeURIComponent(urlYt)}&apikey=shizo`,
                `https://api.giftedtech.my.id/api/download/dlmp3?url=${encodeURIComponent(urlYt)}`,
                `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(urlYt)}`,
                `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(urlYt)}`,
                `https://shizoapi.onrender.com/api/download/ytmp3?apikey=shizo&url=${encodeURIComponent(urlYt)}`
            ];

            for (const api of apis) {
                try {
                    const response = await axios.get(api, { timeout: 20000 });
                    const data = response.data;
                    if (data.status === true || data.success === true || data.result) {
                        audioUrl = data.result?.downloadUrl || data.result?.url || data.result?.download || data.result?.mp3 || data.url;
                        if (audioUrl && audioUrl.startsWith('http')) break;
                    }
                } catch (err) {
                    console.log(`API Failed: ${api}`);
                }
            }
        }

        if (!audioUrl) {
            return await sock.sendMessage(from, { 
                text: "🚫 *Chakra Depleted!* 🌀\n\nFailed to fetch the song from any scroll. Try again later!"
            });
        }

        // Send the audio
        await sock.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: msg });

    } catch (error) {
        console.error('Error in play command:', error);
        await sock.sendMessage(from, { 
            text: "💥 *Explosion Jutsu!* 🌀\n\nSomething went wrong during the mission. Try again!"
        });
    }
}

module.exports = playCommand;
