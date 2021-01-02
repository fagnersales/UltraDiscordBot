const { Collection } = require("discord.js")

const { readdirSync } = require('fs')
const { join } = require('path')

const logger = require('../../src/structures/logger').logger('EVENT_HANDLER')

function eventsHandler(client, eventsPath) {
    client.events = new Collection()
    loadFolder(client, eventsPath)
    listenEvents(client)
}

function loadFolder(client, folder) {
    const files = readdirSync(folder, { withFileTypes: true })

    for (const file of files) {
        if (file.isDirectory()) {
            logger(`Loading the folder: ${file.name}`)
            loadFolder(client, join(folder, file.name))
        }
        else {
            logger(`Loading the file: ${file.name}`)
            loadFile(client, folder, file.name)
        }
    }

}

function loadFile(client, folder, file) {
    const event = require(join(folder, file))

    if (!event.run) return logger(`Event could not be loaded because there's no method for running.`)
    
    const fileName = file.split('.')[0]
    
    if (!event.listeners) event.listeners = [fileName]
    
    if (typeof event.listeners === 'string') event.listeners = [event.listeners]

    for (const listener of event.listeners) {
        const listeningTo = client.events.get(listener) || []
        client.events.set(listener, [...listeningTo, event]) 
    }
}

function listenEvents(client) {
    const listeners = [...client.events.keys()]
    
    for (const listener of listeners) {
        client.on(listener, (...args) => client.events.get(listener).map(event => event.run(client, ...args)))
    }
}

module.exports = eventsHandler