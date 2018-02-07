const express = require('express')
const router = express.Router()
const request = require('request')
const crypto = require('crypto')
const postNoteUrl = id => `https://api.monday.com:443/v1/pulses/${id}/notes.json?api_key=${process.env.API_KEY}`
const pingPulseUrl = id => `https://api.monday.com:443/v1/pulses/${id}.json?api_key=${process.env.API_KEY}`

function validateSecret(req, res, next) {
  if (!req.headers["x-hub-signature"] || !process.env.SECRET_KEY) res.sendStatus(401)
  hash = 'sha1=' +
    crypto.createHmac('sha1', process.env.SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex')
  log(hash)
  if (hash != req.headers["x-hub-signature"]) return res.sendStatus(401)
  next()
}

router.get('/', function (req, res, next) {
  res.send('ok')
})

router.post('/', validateSecret, function (req, res, next) {
  log("Post recived")
  let event = req.headers["x-github-event"]
  switch (event) {
    case "ping":
      log("Ping detected, webhook is working!")
      res.sendStatus(201)
      break;
    case "create":
      handleCreateBranch(req.body, res)
      break;
    case "pull_request":
      handlPullReqOpen(req.body, res)
      break;
    default:
      log(`Erorr in POST: Event ${event} not yet implemented`)
      log(JSON.stringify(req.headers))
      res.sendStatus(501)
      break
  }
});


function handlPullReqOpen(data, _res) {
  log("Handling branch creation")
  let prObj = data.pull_request
  let branchName = prObj.head.ref.match(/(?![0-9]*\/).*/)
  log("branch name extracted: " + branchName)
  let pulseId = prObj.head.ref.match(/\d+/)[0] // pulse id
  log("Pulse id is - " + pulseId)

  checkPulse(pulseId).then(() => {
    let body = `<p><a href="${prObj.html_url}" target="_blank"><strong>${prObj.title}</strong></a></p><p>${prObj.body}</p>`
    if (data.pull_request.merged)
      return postNote(pulseId, `GIT: PR for "${prObj.head.ref}" 'merged'`, body)
    return postNote(pulseId, `GIT: PR for "${prObj.head.ref}" '${data.action}'`, body)
  }).then(() => {
    log("Note created!")
    _res.sendStatus(201)
  }).catch(e => {
    log("ERROR: " + e)
    _res.sendStatus(500)
  })
}

function handleCreateBranch(data, _res) {
  log("handling branch creation")
  let branchName = data.ref.match(/(?![0-9]*\/).*/)
  let pulseId = data.ref.match(/\d+/)[0] // pulse id
  log("Pulse id is - " + pulseId)
  let branchURL = data.repository.html_url + `/tree/${branchName}`

  checkPulse(pulseId).then(() => {
    let body = `<p class="text-center"><a href="${data.ref}" target="_blank"><strong>${data.ref}</strong></a></p>`
    return postNote(pulseId, `GIT: Branch "${data.ref}" 'created'`, body)
  }).then((res) => {
    log("Note created!")
    _res.sendStatus(201)
  }).catch(e => {
    log("ERROR: " + e)
    _res.sendStatus(e || 500)
  })
}


function postNote(id, title, content) {
  log("Pulse Ok. Building Note.")
  return new Promise((_res, _rej) => {
    var options = {
      method: 'post',
      body: {
        id,
        title,
        content
      },
      json: true,
      url: postNoteUrl(id)
    }
    log(`POST body: ${JSON.stringify(options.body)}`)

    if (process.env.NODE_ENV != "development") {
      request(options, function (err, res, body) {
        if (err) _rej(err)
        log("Note posted!")
        if (res.statusCode == 401)
          _rej(res.statusCode)
        if (res.body == "") _rej(500)
        _res(body)
      })
    } else _res(201)
  })
}

function checkPulse(id) {
  log("Checking Pulse")
  return new Promise((res, rej) => {
    if (process.env.NODE_ENV == "development") res(201)
    else {
      request.get(pingPulseUrl(id)).on('response', function (response) {
        if (response.statusCode != 404) res()
        else rej(response.statusCode)
      })
    }
  })
}

function log(msg) {
  console.log("log: " + msg)
}

module.exports = router;