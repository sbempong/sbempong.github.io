# Recently played strip (Last.fm) setup

The strip ships disabled. `data/recent.json` is `{"tracks":[]}`, so the strip stays hidden until these steps are done.

1. Create a free Last.fm account at https://www.last.fm/join and connect an iPhone scrobbler for Apple Music (see the options below).
2. Create an API account at https://www.last.fm/api/account/create. Any application name works, and the callback URL can be left blank. Copy the **API key**. The shared secret is not needed.
3. In GitHub, open sbempong/sbempong.github.io, then Settings, Secrets and variables, Actions:
   - Secrets tab: New repository secret, named `LASTFM_API_KEY`, with the API key as its value.
   - Variables tab: New repository variable, named `LASTFM_USER`, with your Last.fm username as its value.
4. Go to Actions, Last.fm recently played, Run workflow. After that it runs every 30 minutes, and it only commits when the tracks change.

If either value is missing, the workflow logs a skip message and exits successfully.
