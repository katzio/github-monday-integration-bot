# Monday-Github integration

Get notifications in Monday (in form of `Notes`) for the following events:
- Branch `created`
- Pull Request `opened` / `merged` / `closed`

## Setup

![settup](https://www.diigo.com/file/image/baprooepzedrqreacozddarebro/Webhook+-+https%3A%2F%2Fmonday-github-middle-bot.herokuapp.com%2F.jpg)

- Ask @Aryeh.Katz for `Secret`

## Use

- Create a brach with {monday_pulse_id}/branch-name (Bind's branch to Pulse)
![create](https://www.diigo.com/file/image/baprooepzedrqqdeqpzddardecs/monday+-+Small+screen+layout+messed.jpg)
- Create/Merge/close PR with any title and body (no need to specifiy Pulse id)
![prcreate](https://www.diigo.com/file/image/baprooepzedrqqdqsczddardepp/monday+-+Small+screen+layout+messed.jpg)

## Outside of Kik's Monday board:

Setup Heroku's `Config Variables` with Monday's Admin `API_KEY` and a `SECRET_KEY`