module.exports = {
    name: 'Toki.Bot',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    base_url: process.env.BASE_URL || 'http://localhost:3000',
    db: {
        xuri: process.env.DATABASE_URI || 'postgres://postgres:masterkey@localhost:5432/dbtoki',
        uri: process.env.DATABASE_URI || 'postgres://postgres:masterkey@35.242.197.42:5432/db'
    },
};