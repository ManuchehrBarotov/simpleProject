const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройки Telegram
const TELEGRAM_BOT_TOKEN = 'ВАШ_ТОКЕН_БОТА';
const TELEGRAM_CHAT_ID = 'ВАШ_CHAT_ID';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Хранение заявок (для простоты в памяти)
let applications = [];

// Отправка в Telegram
async function sendToTelegram(application) {
    try {
        const message = `📋 НОВАЯ ЗАЯВКА\n
👤 Имя: ${application.name}
📞 Телефон: ${application.phone}
📧 Email: ${application.email || 'не указан'}
📝 Сообщение: ${application.message || 'нет'}
⏰ Время: ${new Date().toLocaleString('ru-RU')}
🔗 IP: ${application.ip || 'неизвестен'}`;

        // Отправляем сообщение
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '✅ Обработано',
                            callback_data: `processed_${application.id}`
                        },
                        {
                            text: '📞 Позвонить',
                            url: `tel:${application.phone}`
                        }
                    ]
                ]
            }
        });

        // Можно отправить уведомление
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: '🔔 Новая заявка!',
            disable_notification: false
        });

        return true;
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error.message);
        return false;
    }
}

// API endpoint для получения заявок
app.post('/api/send-application', async (req, res) => {
    try {
        const { name, phone, email, message } = req.body;
        
        // Валидация
        if (!name || !phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Имя и телефон обязательны' 
            });
        }

        // Создаем заявку
        const application = {
            id: Date.now(),
            name: name.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : '',
            message: message ? message.trim() : '',
            ip: req.ip,
            timestamp: new Date().toISOString(),
            status: 'new'
        };

        // Сохраняем
        applications.unshift(application);
        if (applications.length > 100) {
            applications = applications.slice(0, 100);
        }

        // Отправляем в Telegram
        const sent = await sendToTelegram(application);
        
        if (sent) {
            res.json({ 
                success: true, 
                message: 'Заявка успешно отправлена!',
                data: application
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Ошибка отправки' 
            });
        }
    } catch (error) {
        console.error('Ошибка обработки заявки:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Внутренняя ошибка сервера' 
        });
    }
});

// Получение статистики
app.get('/api/stats', (req, res) => {
    const stats = {
        total: applications.length,
        today: applications.filter(app => {
            const appDate = new Date(app.timestamp);
            const today = new Date();
            return appDate.toDateString() === today.toDateString();
        }).length,
        new: applications.filter(app => app.status === 'new').length,
        processed: applications.filter(app => app.status === 'processed').length
    };
    
    res.json({ success: true, stats });
});

// Получение заявок
app.get('/api/applications', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    const paginatedApps = applications.slice(offset, offset + limit);
    
    res.json({
        success: true,
        data: paginatedApps,
        pagination: {
            page,
            limit,
            total: applications.length,
            pages: Math.ceil(applications.length / limit)
        }
    });
});

// Обновление статуса заявки
app.post('/api/application/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const appIndex = applications.findIndex(app => app.id == id);
    if (appIndex === -1) {
        return res.status(404).json({ success: false, message: 'Заявка не найдена' });
    }
    
    applications[appIndex].status = status;
    applications[appIndex].updated = new Date().toISOString();
    
    res.json({ success: true, data: applications[appIndex] });
});

// Статичные файлы (для фронтенда)
app.use(express.static('public'));

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📧 API доступно по адресу http://localhost:${PORT}/api/send-application`);
});