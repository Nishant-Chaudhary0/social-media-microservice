import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({stack:true}),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: {service: "auth-service"},
    transports: [
        new winston.transport.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            ),
        }),
        new winston.transport.File({filename:"error.log", level:"error"}),
        new winston.transport.File({filename:"combine.log"})
    ]
});

export default logger;