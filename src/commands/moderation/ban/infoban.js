const BaseCommand = require("../../../structures/base/BaseCommand")

const { BanManager } = require('./Manager')
const { BanEmbedder } = require('./Embedder')

const { Client, Message } = require('discord.js')

/**
 * @typedef Props
 * @property {String} userID
 */

/**
 * @typedef SetupParams
 * @property {Client} client
 * @property {Message} message
 */

class InfoBanCommand extends BaseCommand {
    constructor() {
        super({
            id: 3,
            name: 'infoban',
            aliases: ['infobanimento'],
            category: 'moderation',
            description: 'Vê informações de banimento de um usuário do servidor',
            props: {
                'userID': {
                    type: 'number',
                    length: 18,
                    required: true,
                    position: 0,
                    text: 'O ID do usuário que foi banido'
                }
            },
            permissions: {
                member: ['BAN_MEMBERS'],
                client: ['BAN_MEMBERS']
            }
        })

        this.embedder = new BanEmbedder()
        this.manager = new BanManager()
    }

    /** @param {SetupParams} */
    async exec({ message }) {

        /** @type {Props} */
        const { userID } = this.props

        const data = {
            lang: this.lang,
            user: message.client.user
        }

        const infoBan = await this.manager.findByID({ guild: message.guild, userID })

        if (infoBan) {
            const author = await message.client.users.fetch(infoBan.authorID)
            const user = await message.client.users.fetch(infoBan.userID)

            const resolvedBan = {
                bannedAt: infoBan.bannedAt,
                reason: infoBan.reason,
                author: author ? `${author.tag} (${author.id})` : infoBan.authorID,
                user:  user ? `${user.tag} (${user.id})` : infoBan.userID
            }
            
            return message.reply(this.embedder.infoBan({ ban: resolvedBan, texts, data }))

        } else {
            return message.reply(this.texts('not-found', { id: userID }))
        }
    }
}

module.exports = new InfoBanCommand()