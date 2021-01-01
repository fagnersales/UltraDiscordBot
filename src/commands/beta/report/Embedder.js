const { MessageEmbed } = require('discord.js')

const { BaseEmbed } = require('../../../structures/base/BaseEmbed')
const { timeAgo } = require('../../../structures/utils/date')

const createDescription = ({ texts, bugs, state, filterProp }) => {

    const stateSince = state + 'Since'
    const stateReason = state + 'Reason'

    return bugs
        .filter(bug => bug[filterProp])
        .reduce((acc, cur) => {
            const textData = {
                command: cur.command,
                description: cur.description,
                id: cur._id,
                [stateSince]: texts(`${state}-since`, timeAgo(cur[`${state}Since`])),
                [stateReason]: cur[stateReason]
            }
            return acc += texts(`${state}-report`, textData)
        }, '') || texts(`${state}-report-null`)
}

const getState = bug => bug.isOpen ? '🔵' : bug.isResolved ? '🟢' : '🟡'

class Embedder extends BaseEmbed {

    reportDetails({ details, texts, data }) {
        const embed = new MessageEmbed()
            .setDescription(texts('report-details', details))
            .setColor(this.baseColor())
        return this.setCopyright(embed, data.lang, data.user)
    }

    allReports({ bugs, texts, data }) {

        const getState = bug => {
            if (bug.isOpen) return '🔵'
            if (bug.isResolved) return '🟢'
            if (bug.isDisqualified) return '🟡'
        }

        const reducer = (acc, cur) => acc += texts('detailed-report', {
            command: cur.command,
            description: cur.description,
            id: cur._id,
            state: getState(cur)
        })

        const description = bugs.reduce(reducer, '')

        const embed = new MessageEmbed()
            .setDescription(description)
            .setColor(this.baseColor())

        return this.setCopyright(embed, data.lang, data.user)
    }

    reportsState({ bugs, texts, data, state, filterProp }) {

        const description = createDescription({
            texts, bugs, state, filterProp
        })

        const embed = new MessageEmbed()
            .setDescription(description)
            .setColor(this.baseColor())

        return this.setCopyright(embed, data.lang, data.user)
    }

    listReports({ client, reports, data }) {
        const embed = new MessageEmbed()

        const reportedBugs = reports.map(report => {
            const authorUser = client.users.cache.get(report.author)
            const authorString = `${authorUser.tag || 'NotFound#0000'} (${report.author})`
            const bugs = report.bugs.slice(0, 10).map(({ command, description, _id }) => `[Command#${command}] ${description}\n[Identificador] ${_id}`)
            return `\`\`\`\n${authorString}\n${bugs.join('\n')}\`\`\``
        })

        embed.setDescription(reportedBugs.slice(0, 10).join(' '))
        embed.setColor(this.baseColor())

        return this.setCopyright(embed, data.lang, data.user)
    }

    showUserBug({ client, bug, data }) {
        const embed = new MessageEmbed()

        const authorUser = client.users.cache.get(bug.author)
        const authorString = `${authorUser.tag || 'NotFound#0000'} (${bug.author})`

        embed.setDescription(`\`\`\`\n${authorString}\n${getState(bug)} [Commands#${bug.command}]: ${bug.description}\n\`\`\``)

        embed.setColor(this.baseColor())
        return this.setCopyright(embed, data.lang, data.user)
    }
}

module.exports = { Embedder }