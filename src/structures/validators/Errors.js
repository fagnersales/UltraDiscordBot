class ValidateError extends Error {
    constructor(message, props){
        super(message)
        this.message = message
        this.name = 'ValidateError'
        this.props = props
    }
}

module.exports = { ValidateError }
