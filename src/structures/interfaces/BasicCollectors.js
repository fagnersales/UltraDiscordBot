const { Message } = require("discord.js")

class BasicCollectors {
    constructor(data) {
        this.data = data
    }

    /**
     * Creates a simple question to the message author
     * @param {{ time: Number, question: String }}
     * @returns {Promise<String>} Content from the answer
     */
    async userAnswerContent({ time = 30000, question }) {

        if (question) await this.data.quote(question)

        const filter = message => message.author.equals(this.data.message.author) && message.content

        const collector = this.data.message.channel.createMessageCollector(filter, { time, max: 1 })

        return new Promise(resolve => {
            collector.on('end', (collection, reason) => reason === 'limit'
                ? resolve(collection.first().content)
                : resolve(null)
            )

        })
    }

    /**
     * Simple reaction collector
     * @param {{ time: Number, question: String, reactions: String[] }}
     * @returns {Promise<String>} Reaction answered
     */
    async userAnswerReaction({ time = 60000, question, reactions }, options = {}) {
        const quoted = await this.data.quote(question)

        /** @type {Message} */
        const message = await this.data.message.channel.messages.fetch(quoted.id)

        for (const reaction of reactions) await message.react(reaction)

        const filter = (reaction, user) => reactions.includes(reaction.emoji.name) && user.id === this.data.message.author.id

        const collector = message.createReactionCollector(filter, { time, max: 1 })

        return new Promise(resolve => {
            collector.on('end', (collection, reason) => {
                if (options.removeReactions) message.reactions.removeAll()
                if (reason === 'limit') {
                    const chooseOption = collection.first().emoji.id || collection.first().emoji.name
                    options.message
                        ? resolve({ message, choose: chooseOption })
                        : resolve(chooseOption)
                } else {
                    options.message
                        ? resolve({ message })
                        : resolve()
                }
            }
            )
        })
    }
}

module.exports = { BasicCollectors }