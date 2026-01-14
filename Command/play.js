const yts = require('yt-search');
const axios = require('axios');

async function playCommand(sock, from, msg, args) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const searchQuery = text.split(' ').slice(1).join(' ').trim();
        
        if (!searchQuery) {
            return await sock.sendMessage(from, { 
                text: "🍥 *Kage Bunshin no Jutsu!* 🌀\n\nPlease provide a song name to search, shinobi!"
            });
        }

        // Search for the song
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            return await sock.sendMessage(from, { 
                text: "🚫 *Shadow Clone Jutsu Failed!* 🌀\n\nNo songs found in the Hidden Leaf scroll!"
            });
        }

        // Send loading message
        await sock.sendMessage(from, {
            text: "🍥 *Wind Style: Rasenshuriken!* 🌀\n\n_Gathering chakra... your download is in progress!_"
        });

        // Get the first video result
        const video = videos[0];
        const urlYt = video.url;

        // Try multiple APIs for better reliability
        const apis = [
            `https://api.giftedtech.my.id/api/download/dlmp3?url=${urlYt}`,
            `https://apis-keith.vercel.app/download/dlmp3?url=${urlYt}`,
            `https://api.vreden.my.id/api/ytmp3?url=${urlYt}`
        ];

        let audioUrl = null;
        let title = video.title;

        for (const api of apis) {
            try {
                const response = await axios.get(api, { timeout: 15000 });
                const data = response.data;
                
                if (data.status === true || data.success === true || data.status === 200) {
                    audioUrl = data.result?.downloadUrl || data.result?.url || data.result?.download;
                    if (audioUrl) break;
                }
            } catch (err) {
                console.log(`API Failed: ${api}`);
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