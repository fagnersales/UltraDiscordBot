const BaseCommand = require("../../../structures/base/BaseCommand")

const { BanManager } = require('./Manager')
const { BanEmbedder } = require('./Embedder')

const { Client, Message } = require('discord.js')

/**
 * @typedef Props
 * @property {String} IDToUnban
 */

/**
 * @typedef SetupParams
 * @property {Client} client
 * @property {Message} message
 * @property {Props} props
 */

const config = {
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
    permissions: ['BAN_MEMBERS']
}

class InfoBanCommand extends BaseCommand {
    constructor(data) {
        super(data, config)
        this.embedder = new BanEmbedder()
        this.manager = new BanManager()
    }

    /** @param {SetupParams} */
    async setup({ message, props, texts }) {
        const { userID } = props

        const data = {
            lang: this.lang,
            user: this.client.user
        }

        const infoBan = await this.manager.findByID({ guild: message.guild, userID })

        if (infoBan) {
            const author = await this.client.users.fetch(infoBan.authorID)
            const user = await this.client.users.fetch(infoBan.userID)

            const resolvedBan = {
                bannedAt: infoBan.bannedAt,
                reason: infoBan.reason,
                author: author ? `${author.tag} (${author.id})` : infoBan.authorID,
                user:  user ? `${user.tag} (${user.id})` : infoBan.userID
            }
            
            return this.quote(this.embedder.infoBan({ ban: resolvedBan, texts, data }))

        } else {
            return this.quote(texts('not-found', { id: userID }))
        }
    }
}

module.exports = { ...config, run: InfoBanCommand }