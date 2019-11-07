var SpotifyWebApi = require("spotify-web-api-node")
var _ = require("lodash")
var express = require("express")
const app = express()
require('dotenv').config()
const schedule = require('node-schedule')
var spotifyApi = new SpotifyWebApi({
    clientId: process.env.clientIdSpot,
    clientSecret: process.env.clientSecretSpot
})

var SpotifyResult = fetchSpotify()

function fetchSpotify() {
    return spotifyApi
        .clientCredentialsGrant()
        .then(async function(data) {
            spotifyApi.setAccessToken(data.body["access_token"])
            const spotifyLoop = spotifyApi
                .getPlaylist("37i9dQZF1EpsviGW8AJBqR")
                .then(data => {
                    let itemsFilter = _.map(data.body.tracks.items, object => {
                        return _.omit(object, [
                            "added_at",
                            "added_by",
                            "primary_color",
                            "is_local"
                        ])
                    })

                    let uselessFilter = _.map(itemsFilter, object => {
                        return _.omit(object.track, [
                            "available_markets",
                            "disc_number",
                            "track_number",
                            "is_local",
                            "explicit",
                            "episode",
                            "duration_ms",
                            "album",
                            "external_ids",
                            "preview_url",
                            "type",
                            "uri",
                            "popularity"
                        ])
                    })

                    return uselessFilter
                })
            return spotifyLoop
        })
        .then(function(data) {
            console.log(data)
            SpotifyResult = data
            return data
        })
        .catch(function(err) {
            console.log("Unfortunately, something has gone wrong.", err.message)
        })
}

schedule.scheduleJob("0 0 * * *", () => {
    SpotifyResult = fetchSpotify()
})

app.get("/", function(req, res) {
    res.json(SpotifyResult)
})
app.listen(3000)

