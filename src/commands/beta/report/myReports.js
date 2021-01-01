const { Message, MessageEmbed } = require('discord.js')

const BaseCommand = require("../../../structures/base/BaseCommand")
const { Embedder } = require('./Embedder')
const { ReportManager } = require('./Manager')

/**
 * @typedef SetupParams
 * @property {Message} message
 * @property {Props} props
 * @property {Object} texts
 * @property {String} lang
 */


const config = {
    id: 12,
    name: 'meusreports',
    aliases: ['myreports', 'meus-reports', 'my-reports'],
    category: 'beta',
    description: {
        'pt-br': 'Veja os seus reports e como eles estão',
        'en-us': 'See your reports and their state'
    }
}

class MyReportsCommand extends BaseCommand {
    constructor(data) {
        super(data, config)
        this.embedder = new Embedder()
        this.manager = new ReportManager()
    }
    /** @param {SetupParams} */
    async setup({ message, texts, lang }) {
        const bugReports = await this.manager.get({ author: message.author })

        if (!bugReports) return this.quote(texts('null-reports'))

        const { size, open, resolved, disqualified, bugs } = bugReports

        const emojis = ['🔴', '🔵', '🟢', '🟡']

        const reportDailsParams = {
            size: String(size),
            open: String(open),
            resolved: String(resolved),
            disqualified: String(disqualified),
            ...emojis
        }

        const data = {
            lang,
            user: message.member.user
        }

        const embedderReportDetailsParams = {
            texts,
            details: reportDailsParams,
            data
        }

        const EmbedReportDetails = this.embedder.reportDetails(embedderReportDetailsParams)

        const answer = await this.collectors.userAnswerReaction({ question: EmbedReportDetails, reactions: emojis }, { message: true, removeReactions: true })

        if (!answer.choose) return answer.message.delete()

        const query = {
            state: null,
            filterProp: null
        }

        const setQuery = (state, filterProp) => { query.state = state, query.filterProp = filterProp }

        answer.message.edit(this.embedder.allReports({ bugs, texts, data }))

        if (answer.choose === emojis[1]) setQuery('opened', 'isOpen')
        else if (answer.choose === emojis[2]) setQuery('resolved', 'isResolved')
        else if (answer.choose === emojis[3]) setQuery('disqualified', 'isDisqualified')

        answer.message.edit(this.embedder.reportsState({ bugs, texts, data, ...query }))

    }
}

module.exports = { ...config, run: MyReportsCommand }