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
 */

class UnbanCommand extends BaseCommand {
    constructor() {
        super({
            id: 2,
            name: 'unban',
            aliases: ['desbanir'],
            category: 'moderation',
            description: 'Desbane um usuário do servidor',
            props: {
                'IDToUnban': {
                    type: 'number',
                    length: 18,
                    required: true,
                    position: 0,
                    text: 'O ID do usuário a ser desbanido'
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
    async setup({ message }) {

        /** @type {Props} */
        const { IDToUnban } = this.props

        const fetchedBan = await message.guild.fetchBan(IDToUnban).catch(_ => null)

        if (!fetchedBan) {

            const savedBan = await this.manager.findByID({
                guild: message.guild,
                userID: IDToUnban
            })

            if (!savedBan) return message.reply(this.texts('not-found-any-place', { id: IDToUnban }))

            const answer = await this.collectors.userAnswerContent({ question: this.texts('question') })

            if (['y', 's'].includes(answer.toLowerCase())) {

                await this.manager.undo({
                    guild: message.guild,
                    userID: IDToUnban
                })

                return message.reply(this.texts('successfully-removed', { id: IDToUnban }))
            }

        }

        await message.guild.members.unban(IDToUnban).then(_ => message.reply(this.texts('successfully-unbanned', { id: IDToUnban })))

        await this.manager.undo({
            guild: message.guild,
            userID: IDToUnban
        })
    }
}

module.exports = new UnbanCommand()