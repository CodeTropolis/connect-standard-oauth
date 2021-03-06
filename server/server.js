// Replace if using a different env file or config
require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const { resolve } = require("path");
const session = require("express-session");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const uuidv4 = require('uuid').v4;

const app = express();
const port = process.env.PORT || 4242;


app.use(express.static(process.env.STATIC_DIR));

app.use(session({
  secret: uuidv4(),
  resave: false,
  saveUninitialized: true,
}))

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  console.log(`@CodeTropolis: path`, path)
  res.sendFile(path);
});

app.get("/get-oauth-link", async (req, res) => {
  const state = uuidv4();
  req.session.state = state
  const args = new URLSearchParams({
    state,
    client_id: process.env.STRIPE_CLIENT_ID,
    scope: "read_write",
    response_type: "code",
  })
  const url = `https://connect.stripe.com/oauth/authorize?${args.toString()}`;
  return res.send({url});
});

app.get("/authorize-oauth", async (req, res) => {
  console.log("app.get('/authorize-oauth')"); // Logs to terminal
  const { code, state } = req.query;
  
  // Assert the state matches the state you provided in the OAuth link (optional).
  if(req.session.state !== state) {
    return res.status(403).json({ error: 'Incorrect state parameter: ' + state });
  }

  // Send the authorization code to Stripe's API.
  stripe.oauth.token({
    grant_type: 'authorization_code',
    code
  }).then(
    (response) => {
      console.log(`@CodeTropolis: response`, response) // Not logging.
      var connected_account_id = response.stripe_user_id;
      console.log('Connected account ID: ' + connected_account_id); // Not logging.
     // saveAccountId(connected_account_id);

      // Render some HTML or redirect to a different page. 
      // This is set the Integration settings in dashboard.stripe.com
      // So I'm assuming I don't need this next line:
      // return res.redirect(301, '/success.html')
    },
    (err) => {
      if (err.type === 'StripeInvalidGrantError') {
        return res.status(400).json({error: 'Invalid authorization code: ' + code});
      } else {
        return res.status(500).json({error: 'An unknown error occurred.'});
      }
    }
  );
});

const saveAccountId = (id) => {
  // Save the connected account ID from the response to your database.
  console.log(`Connected account ID: ${id}` );
}

app.listen(port, () => console.log(`Node server listening on port ${port}!`));
