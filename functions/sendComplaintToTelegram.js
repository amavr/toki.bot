const promise = require('bluebird'); 

const initOptions = {
    promiseLib: promise // overriding the default (ES6 Promise);
};

const dbUri = process.env.DATABASE_URI;
const fileUrl = process.env.CLIP_FILE_URI || 'https://storage.googleapis.com/geotalki/';

const pgp = require('pg-promise')(initOptions);
const db = pgp(dbUri);


process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_KEY;
const bot = new TelegramBot(token, {polling: false});

exports.sendComplaintToTelegram = (req, res) => {

	let chat_id = req.body.chat_id;
    if(chat_id){
        process.env.TELEGRAM_BOT_MODERATORS = chat_id;
		res.status(200).send(`chat_id change to ${chat_id}`);
        return;
    }

    chat_id = process.env.TELEGRAM_BOT_MODERATORS;
    if(!chat_id){
		res.status(404).send('chat_id is not defined by separating message');
    	return;
    }

    const actor_id = req.body.actor_id;
    const clip_id = req.body.clip_id;

  	if(!actor_id || !clip_id){
		res.status(400).send('Mandatory parameters (actor_id, clip_id) has empty values');
    	return;
    }
  
    const sql =
          "select clip_id, dt, url, lat, lng, " +
          "  author_id, author_phone, author_name, claimer_id, phone, name, " +
          "  clips_x, num_w, num_r, num_b, num_s " +
          "from vi_complains " +
          "where clip_id = '" + clip_id + "' " +
          "and claimer_id = '" + actor_id + "' ";

	db.any(sql)
		.then(rows => {
      
      		if(rows.length === 0){
                res.status(404).send('Author not complained for this clip');
                return;
            }
      
			const r = rows[0];
			const msg =
                'ЖАЛОБА!\n' +
                r.name + ' (' + r.phone + ') жалуется на \n' +
                fileUrl + r.url + '\n\n' +
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
							}
						],
						[{
								text: 'Да, нормальный это клип',
								callback_data: 'clip.spam'
							}
						]
					]
				})
			};
      
			bot.sendMessage(chat_id, msg, options);
      		res.status(200).send(msg);
    	});
};
