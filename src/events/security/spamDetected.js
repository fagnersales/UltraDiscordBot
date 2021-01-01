const { MessageEmbed } = require("discord.js")

const embed = new MessageEmbed()
    .setDescription('A suspicious amount of message were detected! Is that a SPAM?\n`Tap `')
    .setColor('RED')
    .setFooter('UDB-SECURITY SPAM DETECTOR')

module.exports = {
    listeners: 'spamDetected',
    run: async (client, guild, channel, messages, points) => {
        const msg = await channel.send(embed)

        await msg.react('✅')
        await msg.react('❎')

        const handleCollector = (reaction, user) => {
            const filter = (reaction, user) => ['✅', '❎'].includes(reaction.emoji.name) && user.equals(message.guild.owner)

            if (filter(reaction, user)) {
                if (reaction === '❎') {
                    msg.delete()
                    const newPoitns = points + Math.floor(points / 4)

                }
            }
        }

        client.on('messageReactionAdd', handleCollector)

        setTimeout(() => client.removeListener('messageReactionAdd', handleCollector), 15000)

        // console.log(`Spam detected on channel: ${channel.name}\nSpamMessages:`, messages.map(message => message.content))
    }
}