import express from 'express';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const token = process.env.BOT_TOKEN;

if (!token) {
    console.error('ERROR: BOT_TOKEN is missing in .env');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Replace this with your actual Vercel URL after deployment
const GAME_URL = 'https://YOUR-APP-URL.vercel.app';

// Basic bot command
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Привет! Играй в Крестики-нолики прямо в Telegram!', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🎮 Играть в XO', web_app: { url: GAME_URL } }]
            ]
        }
    });
});

// API endpoint for the frontend
app.post('/api/notify', async (req, res) => {
    const { userId, type, promoCode } = req.body;
    console.log(`Received notification request: ${type} for user ${userId}`);

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        if (type === 'WIN') {
            await bot.sendMessage(userId, `🎉 Победа! Ваш промокод: ${promoCode}`);
        } else if (type === 'LOST') {
            await bot.sendMessage(userId, '😔 Проигрыш. Попробуйте еще раз!');
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Telegram API Error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Bot is polling...');
});
