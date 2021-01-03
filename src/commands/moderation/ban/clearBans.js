const BaseCommand = require("../../../structures/base/BaseCommand")

const { BanManager } = require('./Manager')
const { BanEmbedder } = require('./Embedder')

const { Client, Message } = require('discord.js')

/**
 * @typedef SetupParams
 * @property {Client} client
 * @property {Message} message
 */

class ClearBansCommand extends BaseCommand {
    constructor() {
        super({
            id: 4,
            name: 'clearbans',
            aliases: ['limparbans'],
            category: 'moderation',
            description: 'Limpa todos os banimentos feitos no servidor',
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

        await this.manager.clearBans({ guild: message.guild })

        const bans = await message.guild.fetchBans()

        if (bans.size === 0) return message.reply(this.texts('null-bans'))

        for (const [_key, value] of bans) {
            await message.guild.members.unban(value.user.id)
        }

        return message.reply(this.texts('unbanned-all', { size: bans.size }))

    }
}

module.exports = new ClearBansCommand()