const { MessageEmbed } = require('discord.js')

const { Client, Message } = require('discord.js')
const BaseCommand = require('../../structures/base/BaseCommand')

/**
 * @typedef Props
 * @property {String} [commandName]
 */

/**
 * @typedef SetupParams
 * @property {Client} client
 * @property {Message} message
 * @property {Props} props
 * @property {Object} texts
 */

const config = {
    id: 0,
    name: 'help',
    aliases: ['ajuda'],
    category: 'information',
    description: 'Lista todos os comandos e mostra informações sobre eles',
    props: {
        'commandName': {
            type: 'text',
            minLength: 1,
            maxLength: 20,
            text: 'Nome do comando que deseja ver mais informações',
            required: false
        }
    }
}

class HelpCommand extends BaseCommand {
    constructor(data) {
        super(data, config)
    }

    /** @param {SetupParams} */
    async setup({ client, message, props, texts }) {
    
    return this.quote(`Este comando está com mau funcionamento :pensive:`)

        const {  commandName } = props

        const ignoreCategories = ['dev']

        const categories = [...new Set(client.commands.map(command => command.category).filter(category => !ignoreCategories.includes(category)))]

        if (!commandName) return allCommands()

        const command = client.commands.get(commandName) ? client.commands.get(commandName) : client.aliases.get(commandName)
        
        if (!command) return allCommands()
    
        if (command.category && ignoreCategories.includes(command.category)) {
            return this.quote(texts('hidden-category', { category: command.category }))
        }

        const CommandEmbed = new MessageEmbed()
            .setTitle(`${command.name} - Comandos`)
            .setDescription(command.description ? command.description['pt-br'] : '')

        if (command.aliases) CommandEmbed.addField('Aliases', command.aliases.map(aliase => `\`${aliase}\``).join(', '))

        if (command.props) setArgs()

        function setArgs() {
            const props = Object.keys(command.props).map(prop => `> \`${prop}\` - ${command.props[prop].text}`).join('\n')

            const usage = command.name + Object.entries(command.props)
                .map(([text, { required }]) => required ? ` <${text}>` : ` [${text}]`).join('')

            CommandEmbed.addField('Modo de Uso', `\`${process.env.PREFIX + usage}\`\n${props}`)

        }
        
        CommandEmbed.fields.reverse()[0].value += texts('embed-params')
        CommandEmbed
        .setFooter(texts('embed-footer'), client.user.displayAvatarURL())
        .setColor('RANDOM')
        
        message.channel.send(CommandEmbed)


        async function allCommands(getEmbed) {
            const HelpEmbed = new MessageEmbed()
                .setTitle(`${client.user.username} - Comandos`)
                .setDescription(`Meus comandos** (${client.commands.size})**, meu prefixo é \`${process.env.PREFIX}\``)

            const emojis = {
                'beta': '🔎',
                'information': '🎇',
                'main': '🎊'
            }

            const emojiByCategory = category => {
                const emoji = emojis[category]
                if (isNaN(emoji)) return emoji
                else {
                    const customEmoji = (client.emojis.cache.get(emoji))
                    if (customEmoji) {
                        return customEmoji.animated ? `<a:${customEmoji.name}:${customEmoji.id}>` : `<:${customEmoji.name}:${customEmoji.id}>`
                    } else return ''
                }
            }

            const filterCommands = category => command => command.category === category

            for (const category of categories) {
                const categoryCommands = getCategoryCommands(category)
                const title = `${emojiByCategory(category)} ${category} **(${categoryCommands.size})**`
                HelpEmbed.addField(title, categoryCommands.map(({ name }) => `\`${name}\``).join(' | '))

            }
            function getCategoryCommands(category) {
                return client.commands.filter(filterCommands(category))
            }

            if (getEmbed) return HelpEmbed

            const msg = await message.channel.send(HelpEmbed)

            const emojisToReact = categories.map(category => emojis[category]).filter(element => element)

            if (emojisToReact) {
                for (const emoji of [...emojisToReact, emojis['main']]) await msg.react(emoji)

                const categoryByEmoji = emoji => (Object.entries(emojis).find(([_, value]) => (emoji.id || emoji.name || emoji) === value) || [])[0]

                msg.createReactionCollector(_ => true, { time: 60000 })
                    .on('collect', (reaction, user) => {
                        reaction.users.remove(user.id)

                        if (user.equals(message.author)) {
                            const category = categoryByEmoji(reaction.emoji)

                            const main = _ => allCommands(true).then(embed => msg.edit(embed))

                            const categoryCommands = getCategoryCommands(category, true)

                            if (category === 'main' || categoryCommands.size === 0) return main()

                            if (category) {

                                const newEmbed = new MessageEmbed().setTitle(`**${category}** (${categoryCommands.size})`)

                                for (const [name, { description }] of categoryCommands) {
                                    newEmbed.addField(name || 'nonamed', description['pt-br'] || 'nodescription')
                                }
                                msg.edit(newEmbed)
                            }
                        }

                    })
            }
        }
    }
}
module.exports = { ...config, run: HelpCommand }
