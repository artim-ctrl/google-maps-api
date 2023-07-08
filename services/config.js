require('dotenv').config();

module.exports = {
    APP_NAME: process.env.APP_NAME,
    APP_ENV: process.env.APP_ENV,
    APP_PORT: process.env.APP_PORT,

    PROXY_USERNAME: process.env.PROXY_USERNAME,
    PROXY_PASSWORD: process.env.PROXY_PASSWORD,
    PROXY_DNS: process.env.PROXY_DNS,
    PROXY_PORT: process.env.PROXY_PORT,
};
