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
        bot.sendMessage(msg.message.chat.id, `${msg.from.first_name} ${msg.from.last_name} selected '${msg.data}'`)
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

    server.post('/api/v1/telegram/complain', function (req, res, next) {
        console.log("API /telegram/complain");
        /// приняли запрос
        res.send(204, null);

        const actor_id = req.body.actor_id;
        const clip_id = req.body.clip_id;

        const sql =
            "select clip_id, dt, url, lat, lng, " +
            "  author_id, author_phone, author_name, claimer_id, phone, name, " +
            "  clips_x, num_w, num_r, num_b, num_s " +
            "from vi_complains " +
            "where clip_id = '" + clip_id + "' " +
            "and claimer_id = '" + actor_id + "' ";

        console.log(sql);


        toolbox.db.any(sql)
            .then(rows => {

                const r = rows[0];
                const msg =
                    'ЖАЛОБА!\n' +
                    r.name + ' (' + r.phone + ') жалуется на \n' +
                    toolbox.cfg.app.clip_file_url + r.url + '\n\n' +
                    // config.get('page_url') + clip_id + '\n\n' +
                    'Автор: ' + r.author_name + ' (' + r.author_phone + ')\n' +
                    'записал клипов: ' + r.clips_x + '\n' +
                    'обоснованных жалоб: ' + r.num_r + '\n' +
                    'необоснованных жалоб: ' + r.num_w + '\n' +
                    'в ЧС у пользователей: ' + r.num_b + '\n' +
                    'подписчиков: ' + r.num_b + '\n' +
                    'Локация клипа: ' + r.lat + ' ' + r.lng + '\n\n' +
                    'Что будем делать?\n' +
                    '';

                var options = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{
                                text: 'Скрыть клип для всех',
                                callback_data: 'clip.hide:' + clip_id
                            }],
                            [{
                                text: 'Ложная тревога',
                                callback_data: 'clip.spam'
                            }]
                        ]
                    })
                };

                const chat_id = toolbox.cfg.telegram.chat_id;
                bot.sendMessage(chat_id, msg, options);

            })
            .catch(error => {
                console.log('ERROR:', error); // print the error;
            })
        // .finally(toolbox.db.$pool.end); // For immediate app exit, shutting down the connection pool


        // let sco;
        // toolbox.db.connect()
        //     .then(obj => {
        //         sco = obj;

        //     })
        //     .catch(error => {
        //         console.log('connection error');
        //         console.log(error);
        //     })
        //     .finally(() => {
        //         // release the connection, if it was successful:
        //         if (sco) {
        //             // if you pass `true` into method done, i.e. done(true),
        //             // it will make the pool kill the physical connection.
        //             sco.done();
        //         }
        //     });

        next();
    });

}

const sleep = (time) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(), time);
    });
}