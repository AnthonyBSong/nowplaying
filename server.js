const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/callback', (req, res) => {
  const authorizationCode = req.query.code;
  res.send(`Authorization Code: ${authorizationCode}`);
});

app.get('/api/current-playing', async (req, res) => {
  const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env;

  const authOptions = {
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
    },
    data: `grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}`,
  };

  try {
    const authResponse = await axios(authOptions);
    const accessToken = authResponse.data.access_token;

    const nowPlayingOptions = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/me/player/currently-playing',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
    };

    const nowPlayingResponse = await axios(nowPlayingOptions);
    res.json(nowPlayingResponse.data);
  } catch (error) {
    console.error('Error fetching currently playing track:', error.response ? error.response.data : error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
