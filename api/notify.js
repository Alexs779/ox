import TelegramBot from 'node-telegram-bot-api';

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false }); // No polling in serverless

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, type, promoCode } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        if (type === 'WIN') {
            await bot.sendMessage(userId, `🎉 Победа! Ваш промокод: ${promoCode}`);
        } else if (type === 'LOST') {
            await bot.sendMessage(userId, '😔 Проигрыш. Попробуйте еще раз!');
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Telegram API Error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
}
