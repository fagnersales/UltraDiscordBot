const { User } = require('discord.js')

const { BugReportModel } = require('../../../structures/providers/BugReportModel')

/**
 * @typedef addData
 * @property {User} author
 * @property {{ command: String, description: String }} reportedBug
 */

/**
 * @typedef getData
 * @property {User} author
 */
class ReportManager {

    /**
     * Creates a new report
     * @param {addData}
     * @returns {Promise<Number>} */
    async add({ author, reportedBug }) {

        const { command, description } = reportedBug

        const query = { author: author.id }

        const update = {
            author: author.id,
            $push: {
                bugs: { command, description }
            },
            $inc: { size: 1, open: 1 }
        }

        const bugReport = await BugReportModel.findOneAndUpdate(query, update, { upsert: true, new: true })

        return bugReport.size
    }

    /** Gets all reports made by an user
     * @param {getData}
     * @returns {Promise<any>}
     */
    async get({ author }) {
        const query = { author: author.id }

        const bugReports = await BugReportModel.findOne(query)

        return bugReports
    }

    async getByID(id) {
        const allReports = await this.getAll()
        return new Promise(resolve => {
            allReports.forEach(report => {
                const bug = report.bugs.find(bug => bug._id == id)
                resolve({ ...bug._doc, author: report.author })
            })
        })
    }

    /**
     * Gets all reports
     * @returns {Promise<any>}
     */
    async getAll() {

        const allBugReports = await BugReportModel.find({})

        return allBugReports
    }
    async getAllWithOpenBugs() {
        const allReports = await this.getAll()

        const allOpenBugReports = allReports
            .filter(report => report.open >= 1)
            .map(report => ({ ...report._doc, bugs: report.bugs.filter(bug => bug.isOpen) }))

        return allOpenBugReports
    }

    async act({ author, bugId, action, reason = 'none' }) {

        const queryForDisqualify = [
            { property: 'bugs.$.isDisqualified', value: true },
            { property: 'bugs.$.isOpen', value: false },
            { property: 'bugs.$.disqualifiedReason', value: reason }
        ]

        const queryForResolve = [
            { property: 'bugs.$.isResolved', value: true },
            { property: 'bugs.$.isOpen', value: false },
            { property: 'bugs.$.resolvedReason', value: reason }
        ]

        const queryChanges = action === 'disqualify' ? queryForDisqualify : queryForResolve

        const valueToSet = queryChanges.reduce((acc, cur) => ({ ...acc, [cur.property]: cur.value }), {})

        const query = { author, bugs: { $elemMatch: { '_id': bugId } } }
        const value = { $set: valueToSet }
        const options = { 'new': true }

        const newDocument = await BugReportModel.updateOne(query, value, options)

        if (newDocument.nModified > 0) {

            const queryForDisqualifySince = { 'bugs.$.disqualifiedSince': Date.now() }
            const queryForResolveSince = { 'bugs.$.resolvedSince': Date.now() }

            await BugReportModel.updateOne(query, { $set: action === 'disqualify' ? queryForDisqualifySince : queryForResolveSince })

            const whereToIncrement = action === 'disqualify' ? 'disqualified' : 'resolved'

            await BugReportModel.findOneAndUpdate({ author }, { $inc: { open: -1, [whereToIncrement]: 1 } }, { new: true })

            return true
        }

        return false

    }

}

module.exports = { ReportManager }