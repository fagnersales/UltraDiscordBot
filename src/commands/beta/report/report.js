const { Client, Message } = require('discord.js')

const BaseCommand = require("../../../structures/base/BaseCommand")
const { ReportManager } = require('./Manager')

/**
 * @typedef Props
 * @property {String} commandName
 * @property {String} bugDescription
 */

/**
 * @typedef SetupParams
 * @property {Client} client
 * @property {Message} message
 * @property {Props} props
 * @property {Object} texts
 */


const config = {
    id: 11,
    name: 'reportar',
    aliases: ['report'],
    category: 'beta',
    description: {
        'pt-br': 'Faça um report sobre um bug encontrado',
        'en-us': 'Report a bug that you found'
    },
    props: {
        'commandName': {
            type: 'command',
            maxLength: 20,
            text: 'Nome do comando que você está reportando',
            required: true,
            position: 0
        },
        'bugDescription': {
            type: 'text',
            minLength: 5,
            maxLength: 600,
            text: 'Descreva o bug e o que acontece nele',
            joinSpace: true,
            required: true,
            position: 1
        }
    }
}

class ReportCommand extends BaseCommand {
    constructor(data) {
        super(data, config)

        this.manager = new ReportManager()
    }
    /** @param {SetupParams} */
    async setup({ message, props, texts }) {
        const { commandName, bugDescription } = props

        const bugsReportedSize = await this.manager.add({
            author: message.author,
            reportedBug: {
                command: commandName,
                description: bugDescription
            }
        })

        this.client.devs.forEach(devID => {
            this.client.users.cache.get(devID).send(`New report!\n**Command:**\n${commandName}\n**Description:**\n${bugDescription}\n**From:** ${message.author.tag} ${message.guild.name} (${message.guild.id})`)
        })
        
        this.quote(texts('succesffully-reported', { bugsReportedSize }))
    }
}

module.exports = { ...config, run: ReportCommand }