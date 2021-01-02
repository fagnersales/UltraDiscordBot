const BaseCommand = require('../../structures/base/BaseCommand')

const { systems } = require('../../structures/logger')
const Discord = require('discord.js')
const { MessageEmbed } = Discord

const config = {
    name: 'eval',
    category: 'dev',
    aliases: ['ev'],
    description: 'Execute code in bot'
}

const { inspect } = require('util')

class EvalCommand extends BaseCommand {
    constructor(data) {
        super(data, config)

    }

    setup({ client, message, args }) {

        if (!client.devs.includes(message.author.id)) this.quote('Nao pode fazer isso não amigo')
        else {
            try {
                let code = eval(args.join(' ').replace('```js', '').replace('```', ''))
                if (typeof code !== 'string') code = inspect(code, { depth: 0 });
                message.channel.send('```js\n' + code + '\n```')
            }
            catch (err) {
                console.log(err)
                message.channel.send('```\n' + err + '\n```')
            }
        }

    }
}

module.exports = { ...config, run: EvalCommand }
