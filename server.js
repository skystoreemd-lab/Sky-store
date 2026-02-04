const express = require('express');
const path = require('path');
const https = require('https');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Telegram Configuration
const BOT_TOKEN = '8291119939:AAHodtowSjgnCcTN256ZIVCZUKMNuesxovQ';
const CHAT_ID = '1770193656'; // تم استخراج Chat ID الخاص بك لضمان وصول الرسائل

app.post('/api/order', (req, res) => {
    const { product, price, gov, area, phone } = req.body;
    const date = new Date().toLocaleString('ar-IQ', { timeZone: 'Asia/Baghdad' });

    const message = `
🌟 *طلب جديد من Sky Store* 🌟

📦 *المنتج:* ${product}
💰 *السعر:* ${price}

👤 *تفاصيل الزبون:*
📍 *المحافظة:* ${gov}
🏠 *المنطقة:* ${area}
📞 *رقم الهاتف:* \`${phone}\`

⏰ *التاريخ:* ${date}
    `;

    const data = JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
    });

    const request = https.request(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    }, (response) => {
        let body = '';
        response.on('data', (chunk) => body += chunk);
        response.on('end', () => {
            if (response.statusCode === 200) {
                res.status(200).json({ success: true });
            } else {
                console.error('Telegram Error:', body);
                res.status(500).json({ success: false, error: 'Telegram API Error' });
            }
        });
    });

    request.on('error', (error) => {
        console.error('Request Error:', error);
        res.status(500).json({ success: false, error: 'Connection Error' });
    });

    request.write(data);
    request.end();
});

// Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Railway uses the PORT environment variable
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sky Store running on port ${PORT}`);
});
