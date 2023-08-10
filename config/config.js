'use strict'

import { config } from 'dotenv'

config()

export const APP_NAME = process.env.APP_NAME
export const APP_ENV = process.env.APP_ENV
export const APP_PORT = process.env.APP_PORT
export const PROXY = 'true' === process.env.PROXY
export const PROXY_SECURE = 'true' === process.env.PROXY_SECURE
export const PROXY_USERNAME = process.env.PROXY_USERNAME
export const PROXY_PASSWORD = process.env.PROXY_PASSWORD
export const PROXY_DNS = process.env.PROXY_DNS
export const PROXY_PORT = process.env.PROXY_PORT
