const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const currentLevel = process.env.LOG_LEVEL || "INFO";

function log(level, message, meta = {}) {
    if (LOG_LEVELS[level] > LOG_LEVELS[currentLevel]) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...meta
    };

    if (level === "ERROR") {
        console.error(JSON.stringify(logEntry));
    } else if (level === "WARN") {
        console.warn(JSON.stringify(logEntry));
    } else {
        console.log(JSON.stringify(logEntry));
    }
}

export const logger = {
    error: (message, meta) => log("ERROR", message, meta),
    warn: (message, meta) => log("WARN", message, meta),
    info: (message, meta) => log("INFO", message, meta),
    debug: (message, meta) => log("DEBUG", message, meta)
};
