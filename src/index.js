require('dotenv').config()

const { Client } = require('discord.js')
const { join } = require('path')

const client = new Client({
    disableMentions: 'everyone'
})

const commandHandler = require('../config/handlers/commands')
const commandsPath = join(__dirname, 'commands')
commandHandler(client, commandsPath)

const eventHandler = require('../config/handlers/events')
const eventsPath = join(__dirname, 'events')
eventHandler(client, eventsPath)

client.defaults = {
    spamDetectorPoints: 15
}

client.devs = ['474407357649256448']

require('mongoose').connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

client.login(process.env.TOKEN)