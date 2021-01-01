const { Schema, model } = require('mongoose')

const BugSchema = new Schema({
    command: { type: String, required: true },
    description: { type: String, required: true },
    openedDate: { type: Date, default: new Date() },
    openedTimestamp: { type: String, default: Date.now() },
    isOpen: { type: Boolean, default: true },
    isResolved: { type: Boolean, default: false },
    resolvedSince: { type: String },
    resolvedReason: { type: String },
    isDisqualified: { type: Boolean, default: false },
    disqualifiedSince: { type: String },
    disqualifiedReason: { type: String }
})

const BugReportSchema = new Schema({
    author: { type: String, required: true },
    bugs: [BugSchema],
    size: { type: Number, default: 0 },
    open: { type: Number, default: 0 },
    resolved: { type: Number, default: 0 },
    disqualified: { type: Number, default: 0 },
})
const BugReportModel = new model('BugReport', BugReportSchema)

module.exports = { BugReportModel }