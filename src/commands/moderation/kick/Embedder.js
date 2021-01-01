const { MessageEmbed } = require('discord.js')

const { BaseEmbed } = require('../../../structures/base/BaseEmbed')
const { timeAgo } = require('../../../structures/utils/date')

class KickEmbedder extends BaseEmbed {

    infoKick({ kick, texts, data }) {

        const embed = new MessageEmbed()
            // .setTitle(`Informações do expulsamento de: ${ban.user}`)
            // .setDescription(`:white_small_square:**Motivo do banimento**: ${ban.reason}\n:white_small_square:**Banido por**: ${ban.author}\n\n:white_small_square:${texts('banned-since', timeAgo(ban.bannedAt))}`)
            .setColor(this.baseColor())

        return this.setCopyright(embed, data.lang, data.user)
    }
}

module.exports = { KickEmbedder }