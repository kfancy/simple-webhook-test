# simple-webhook-test

1. clone repo
2. `npm install` in the root directory
3. make .env file (see below)
4. to run, node index.js

#config

use .env file (not tracked by github) to set up config

in the root directory of the repo, make a file ".env"
contents of file:

```
PORT=3333
```

(change port number to whatever you want to run the app under)

#usage

put the URL and method into the form of where you want the app to send to

in the app data, either use the webhook URL directly (from the top of the page), or use the key "WEBHOOK_URL" in your JSON data and it will be replaced on send.