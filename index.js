var SpotifyWebApi = require("spotify-web-api-node")
var _ = require("lodash")
var express = require("express")
const app = express()

const axios = require("axios")
require("dotenv").config()
const schedule = require("node-schedule")
var spotifyApi = new SpotifyWebApi({
    clientId: process.env.clientIdSpot,
    clientSecret: process.env.clientSecretSpot
})

var binId = "5dc80bbca5f7237736c43f13"

// var SpotifyResult = fetchSpotify()

function fetchSpotify() {
    return spotifyApi
        .clientCredentialsGrant()
        .then(async function(data) {
            spotifyApi.setAccessToken(data.body["access_token"])
            const spotifyLoop = spotifyApi
                .getPlaylist("37i9dQZF1EpsviGW8AJBqR")
                .then(data => {
                    // console.log("raw", data)

                    let itemsFilter = _.map(data.body.tracks.items, object => {
                        return _.omit(object, [
                            "added_at",
                            "added_by",
                            "primary_color",
                            "is_local"
                        ])
                    })
                    // console.log("itemsFilter", itemsFilter)

                    itemsFilter = _.map(data.body.tracks.items, object => {
                        return _.omit(object.track, [
                            "available_markets",
                            "disc_number",
                            "track_number",
                            "is_local",
                            "explicit",
                            "episode",
                            "duration_ms",
                            "external_ids",
                            "preview_url",
                            "type",
                            "uri",
                            "popularity"
                        ])
                    })
                    // console.log("uselessFilter", itemsFilter)

                    Object.keys(itemsFilter).forEach(item => {
                        delete itemsFilter[item]["album"]["album_type"]
                        delete itemsFilter[item]["album"]["available_markets"]
                        delete itemsFilter[item]["album"]["artists"]
                        delete itemsFilter[item]["album"]["external_urls"]
                        delete itemsFilter[item]["album"]["href"]
                        delete itemsFilter[item]["album"]["id"]
                        delete itemsFilter[item]["album"]["name"]
                        delete itemsFilter[item]["album"]["release_date"]
                        delete itemsFilter[item]["album"]["release_date_precision"]
                        delete itemsFilter[item]["album"]["total_tracks"]
                        delete itemsFilter[item]["album"]["type"]
                        delete itemsFilter[item]["album"]["uri"]
                    })
                    // itemsFilter = _.map(data.body.tracks.items, current => {
                    //     return _.omit(current.track.album, [
                    //         "available_markets",
                    //         "external_urls",
                    //         "release_date",
                    //         "release_date_precision",
                    //         "total_tracks",
                    //         "type",
                    //         "uri"
                    //     ])
                    // })
                    // console.log("hey", itemsFilter)

                    return itemsFilter
                })
            return spotifyLoop
        })
        .then(function(data) {
            // console.log(JSON.stringify(data))
            SpotifyResult = data
            return JSON.stringify(data, null, 0)
        })
        .catch(function(err) {
            console.log("Unfortunately, something has gone wrong.", err.message)
        })
}

schedule.scheduleJob("0 0 * * *", () => {
    postDataBox()
})

async function postDataBox() {
    axios({
        method: "put",
        url: `https://api.jsonbin.io/b/5dc840e6c9b247772abd680b`,
        headers: {
            "Content-type": "application/json",
            "secret-key": process.env.jsonBinSecret
        },
        data: await fetchSpotify()
    })
        .then(function(response) {
            // handle success
            console.log(response)
        })
        .catch(function(error) {
            // handle error
            console.log(error)
        })
}

postDataBox()
app.get("/", function(req, res) {
    // res.json(SpotifyResult)
})
app.listen(8080)
