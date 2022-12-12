const model = require('../model/model')
const shortid = require('shortid')
const axios = require('axios')


const checkInputsPresent = (value) => { return (Object.keys(value).length > 0) }

const isValid = function (value) {
    if (typeof value == "number" || typeof value == 'undefined || value == null') { return false }
    if (typeof value == "string" && value.trim().length == 0) {
        return false
    }
    return true
};


exports.urlshorter = async (req, res) => {

    try {

        let originalURL = req.body

        let { longUrl, ...rest } = originalURL

        if (!checkInputsPresent(originalURL)) return res.status(400).send({ status: false, message: "Please Provide Data" })
        if (checkInputsPresent(rest)) return res.status(400).send({ status: false, message: "You can input only longUrl." })

        if (!isValid(longUrl)) { return res.status(400).send({ status: false, message: 'Please Provide Valid longUrl' }) }

        let option = {
            method: 'get',
            url: longUrl
        }

        let urlValidate = await axios(option)
            .then(() => longUrl) // axios is 
            .catch(() => null)

        if (!urlValidate) { return res.status(400).send({ status: false, message: `This Link: ${longUrl} is not valid URL` }) }

        let isPresent = await model.findOne({ longUrl: longUrl })

        if (isPresent) {

            let isPresentObj = {
                longUrl: isPresent.longUrl,
                shortUrl: isPresent.shortUrl,
                urlCode: isPresent.urlCode

            }

            return res.status(200).send({ status: true, message: `For this LongUrl use this ShortUrl: ${isPresent.shortUrl}`, data: isPresentObj })
        }

        let baseUR1 = "http://localhost:3000/"
        originalURL.urlCode = shortid.generate().toLowerCase()
        originalURL.shortUrl = baseUR1 + originalURL.urlCode

        let createURL = await model.create(originalURL)

        return res.status(201).send({ status: true, data: originalURL })

    } catch (error) {

        return res.status(500).send({ status: 'error', error: error.message })
    }
}