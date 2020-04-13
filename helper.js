module.exports = {
    post(url, data) {
        console.log('in post', url, data);
        return fetch(url, {
            method: "POST",
            headers: {
                "Accept": "application/json, text/plain",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

    }
}