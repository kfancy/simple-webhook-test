# simple-webhook-test

1. clone repo
2. `npm install` in the root directory
3. make .env file (see below)
4. to run, node index.js
(or, to run constantly,
forever start --minUptime 1000 --spinSleepTime 1000 --uid webhook-tester -a -l webhook-tester index.js
)
#config

use .env file (not tracked by github) to set up config

in the root directory of the repo, make a file ".env"
contents of file:

```
PORT=3333
```

(change port number to whatever you want to run the app under)
