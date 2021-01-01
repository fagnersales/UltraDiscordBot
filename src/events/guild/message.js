const { Client, Message } = require("discord.js");

module.exports = {
    listeners: 'message',
    /**
     * @param {Client} client 
     * @param {Message} message 
     */
    run: (client, message) => {
        if (
            message.author.bot
            || !message.guild
            || !message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')
        ) return

        const prefix = process.env.PREFIX
        if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase()

        const command = client.commands.get(cmd) ? client.commands.get(cmd) : client.aliases.get(cmd)

        if (!command) return message.channel.send('Comando não encontrado!').then(msg => msg.delete({ timeout: 10000 }))

        const data = { client, message, args }
        try {
            new command.run(data)
        } catch (error) {
            if (error.message === 'command.run is not a constructor') {
                command.run(data)
            } else {
                console.log(error)
                message.channel.send(`Something went wrong trying to run this command...`)
            }
        }
    }
}