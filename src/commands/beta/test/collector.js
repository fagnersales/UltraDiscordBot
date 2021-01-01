const BaseCommand = require('../../../structures/base/BaseCommand')

const config = {
    id: 'collector test',
    name: 'col'
}

class ReportsCommand extends BaseCommand {
    constructor(data) {
        super(data, config)
    }

    async setup({ client, message, args, texts, lang }) {
        const msg = await message.channel.send('Hi')

        await msg.react('✅')
        await msg.react('❎')

        const time = 5000

        const handleCollect = (messageReaction, user) => {
            const filter = (reaction, user) => ['✅', '❎'].includes(reaction.emoji.name) && user.equals(message.author)

            if (filter(messageReaction, user)) console.log('collected from the right user!')
        }

        client.on('messageReactionAdd', handleCollect)

        setTimeout(() => { client.removeListener('messageReactionAdd', handleCollect) }, 5000)
    }
}
module.exports = { ...config, run: ReportsCommand }
