const systems = {
    COMMAND_HANDLER: {
        logging: false
    },
    EVENT_HANDLER: {
        logging: false
    },
    SPAM_DETECTOR: {
        logging: false
    }
}

const logger = (systemName) => (...data) => {
    const system = systems[systemName.toUpperCase()]
    if (system && system.logging === true) console.log(`> ${systemName}:`, ...data)
}

module.exports = { systems, logger }