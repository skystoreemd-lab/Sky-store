const express = require('express');
const path = require('path');
const https = require('https');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Configuration using Environment Variables for Security
const BOT_TOKEN = process.env.BOT_TOKEN || '8291119939:AAHodtowSjgnCcTN256ZIVCZUKMNuesxovQ';
const CHAT_ID = process.env.CHAT_ID || '7372428049';

app.post('/api/order', (req, res) => {
    const { product, quantity, price, gov, area, phone, notes } = req.body;
    const date = new Date().toLocaleString('ar-IQ', { timeZone: 'Asia/Baghdad' });

    // Prepare WhatsApp Confirmation Message for the Admin
    const waMessage = `السلام عليكم
فريق Sky Store لتأكيد الطلبات
طلبكم بالمعلومات أدناه:
المحافظة: ${gov}
المنطقة: ${area}
رقم الهاتف: ${phone}
عدد القطع: ${quantity}
وقت تثبيت الطلب: ${date}
تم تأكيد الطلب
سيتم تجهيز الطلب وشحنه إلى عنوانكم في أقرب وقت ممكن.
شكرًا لاختياركم Sky Store 🤍`;

    const encodedWaMessage = encodeURIComponent(waMessage);
    // Clean phone number (remove leading 0 and add 964)
    let cleanPhone = phone.startsWith('0') ? '964' + phone.substring(1) : (phone.startsWith('964') ? phone : '964' + phone);
    const waLink = `https://wa.me/${cleanPhone}?text=${encodedWaMessage}`;

    const telegramMessage = `
🌟 *طلب جديد من Sky Store* 🌟

📦 *المنتج:* ${product}
🔢 *الكمية:* ${quantity} قطعة
💰 *السعر:* ${price}

👤 *تفاصيل الزبون:*
📍 *المحافظة:* ${gov}
🏠 *المنطقة:* ${area}
📞 *رقم الهاتف:* \`${phone}\`
📝 *الملاحظات:* ${notes}

⏰ *التاريخ:* ${date}

✅ [اضغط هنا لتأكيد الطلب عبر واتساب](${waLink})
    `;

    const data = JSON.stringify({
        chat_id: CHAT_ID,
        text: telegramMessage,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
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
                res.status(200).json({ success: true, message: 'تم تثبيت الطلب بنجاح' });
            } else {
                console.error('Telegram Error:', body);
                res.status(500).json({ success: false, error: 'فشل الإرسال إلى تيليجرام' });
            }
        });
    });

    request.on('error', (error) => {
        console.error('Request Error:', error);
        res.status(500).json({ success: false, error: 'خطأ في الاتصال' });
    });

    request.write(data);
    request.end();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
