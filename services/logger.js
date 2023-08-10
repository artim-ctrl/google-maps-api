'use strict'

import DailyRotateFile from 'winston-daily-rotate-file'
import { APP_ENV } from '../config/config.js'
import { createLogger, format } from 'winston'

const { combine, timestamp, label, printf, splat, metadata } = format

const rotateFileTransport = new DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
})

const logFormat = printf(({ timestamp, label, level, message, metadata }) => {
    return `${timestamp} [${label}] ${level}: ${message} ${JSON.stringify(
        metadata
    )}`
})

const logger = createLogger({
    format: combine(
        label({ label: APP_ENV }),
        timestamp(),
        splat(),
        metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
        logFormat
    ),
    transports: [rotateFileTransport],
})

export { logger }
