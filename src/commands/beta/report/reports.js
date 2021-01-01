const { MessageEmbed } = require('discord.js')
const BaseCommand = require('../../../structures/base/BaseCommand')
const { Embedder } = require('./Embedder')
const { ReportManager } = require('./Manager')

const config = {
    id: 13,
    name: 'reports',
    category: 'dev',
}

class ReportsCommand extends BaseCommand {
    constructor(data) {
        super(data, config)
        this.manager = new ReportManager()
        this.embedder = new Embedder()
    }

    async setup({ client, message, args, texts, lang }) {
        if (!client.devs.includes(message.author.id)) return

        const data = { lang, user: message.author }

        if (args[0] === 'help') return this.quote(`[bugID] [action] [author] [...reason]`)

        const bugId = args[0]
        const action = args[1]
        const author = args[2]
        const reason = args.slice(3).join(' ')

        if (!bugId) {
            const reports = await this.manager.getAllWithOpenBugs()

            if (!reports.length) return this.quote(texts('no-open-reports'))

            return this.quote(this.embedder.listReports({ client, reports, data }))
        }

        const bug = await this.manager.getByID(bugId)

        if (!action) return this.quote(this.embedder.showUserBug({ client, bug, data }))

        const actions = ['disqualify', 'resolve']

        const actionsMapped = actions.map(action => `\`${action}\``).join(', ')

        if (!actions.includes(action)) return this.quote(texts('unavailable-action', { actions: actionsMapped }))

        if (!author) return this.quote(texts('missing-author'))

        const result = await this.manager.act({ action, reason, author, bugId })

        const resultText = result === true ? 'success' : 'error'

        const authorUsername = (client.users.cache.get(author) || {}).tag || "NotFound#0000"

        this.quote(texts(`${resultText}-${action}`, { bugId, author: authorUsername }))
    }
}

module.exports = { ...config, run: ReportsCommand }
