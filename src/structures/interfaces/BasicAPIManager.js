const fetch = require('node-fetch')

class BasicAPIManager {
    constructor(data) {
        /**
         * Base URI for doing the requests
         */
        this.baseURI = data.baseURI
    }

    post({ path, body, authorization }) {
        return fetch(this.baseURI + `/${path.join('/')}`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorization
            }
        }).then(result => result.json())
    }
}

module.exports = { BasicAPIManager }