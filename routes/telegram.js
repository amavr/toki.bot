'use strict';

const errors = require('restify-errors');

module.exports = function (server, toolbox) {


    process.env.NTBA_FIX_319 = 1;
    const TelegramBot = require('node-telegram-bot-api');
    const Agent = require('socks5-https-client/lib/Agent');

    // replace the value below with the Telegram token you receive from @BotFather
    const token = process.env.TELEGRAM_BOT_KEY;

    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, {
        polling: false,
        request: {
            agentClass: Agent,
            agentOptions: {
                socksHost: process.env.PROXY_SOCKS5_HOST,
                socksPort: parseInt(process.env.PROXY_SOCKS5_PORT),
                socksUsername: process.env.PROXY_SOCKS5_USERNAME,
                socksPassword: process.env.PROXY_SOCKS5_PASSWORD
            }
        }
    });
    toolbox.bot = bot;

    bot.setWebHook(process.env.TELEGRAM_WEBHOOK_URL + '/api/v1/telegram/webhook');

    server.post('/api/v1/telegram/webhook', function (req, res, next) {
        console.log('onHook');
        console.log(JSON.stringify(req.body));
        bot.processUpdate(req.body);
        res.send(200, {});
        next();
    });


    bot.on('callback_query', (msg) => {
        console.log('onCallback');
        console.log(JSON.stringify(msg));
        bot.sendMessage(msg.message.chat.id, `${ msg.from.first_name} ${ msg.from.last_name} selected '${msg.data}'`)
            .then(x => {
                console.log(x);
            })
            .catch(x => {
                console.log(x);
            });

        bot.deleteMessage(msg.message.chat.id, msg.message.message_id)
            .then(isOk => {
                console.log(isOk ? 'message has been deleted' : 'delete operation had problem');
            })
            .catch(x => {
                console.log(x);
            });
    });

    // Just to ping!
    bot.on('message', msg => {
        console.log('onMessage')
        bot.sendMessage(msg.chat.id, 'I am alive!');
    });

    /// body: {"chat_id": 12345, "msg": "some text", "options": {"reply_markup": "..."}}
    server.post('/api/v1/telegram/send', function (req, res, next) {
        console.log("API /telegram/send");
        /// приняли запрос
        res.send(204, null);

        if (req.body.options && req.body.options.reply_markup) {
            req.body.options.reply_markup = JSON.stringify(req.body.options.reply_markup);
        }

        /// отправили в бот
        bot.sendMessage(req.body.chat_id, req.body.msg, req.body.options);

        next();
    });

}

const sleep = (time) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(), time);
    });
}