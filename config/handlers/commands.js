const { Collection } = require("discord.js")

const { readdirSync } = require('fs')
const { join } = require('path')

function commandHandler(client, commandsPath) {
    if (!client.commands) client.commands = new Collection()
    if (!client.aliases) client.aliases = new Collection()

    loadFolder(client, commandsPath)

}

function loadFolder(client, folder) {
    const files = readdirSync(folder, { withFileTypes: true })

    for (const file of files) {
        if (file.isDirectory()) {
            console.log(`> CommandHandler: Loading the folder: ${file.name}`)
            loadFolder(client, join(folder, file.name))
        }
        else {
            console.log(`> CommandHandler: Loading the file: ${file.name}`)
            loadFile(client, folder, file.name)
        }
    }

}

function loadFile(client, folder, file) {
    const command = require(join(folder, file))

    if (!command.run) return console.log(`Command could not be loaded because there's no method for running.`)

    if (!command.name) command.name = file.split('.')[0]
    if (!command.category) command.category = 'none'
    
    client.commands.set(command.name, command)
    console.log(`> CommandHandler: Command ${command.name} loaded`)

    if (command.aliases) {
        for (const alias of command.aliases) {
            client.aliases.set(alias, command)
            console.log(`> CommandHandler: Alias ${alias} synced with ${command.name}`)
        }
    }
}

module.exports = commandHandler