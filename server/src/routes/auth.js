const express = require('express');
const querystring = require('querystring');
const axios = require('axios');
const router = express.Router();

function getGoogleLoginURI() {
  const rootUrl = `https://accounts.google.com/o/oauth2/v2/auth`;
  const options = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.SERVER_ROOT_URI}${process.env.GOOGLE_REDIRECT_URI}`,
    response_type: 'code',
    scope: [`https://www.googleapis.com/auth/userinfo.email`, `https://www.googleapis.com/auth/userinfo.profile`].join(
      ' '
    ),
    access_type: 'offline',
    // login_hint: 'ckgudcjf@gmail.com',
    prompt: 'consent',
  };
  return `${rootUrl}?${querystring.stringify(options)}`;
}

function getGoogleUserToken({ code, client_id, client_secret, redirect_uri }) {
  const rootUrl = 'https://oauth2.googleapis.com/token';
  const options = {
    code,
    client_id,
    client_secret,
    redirect_uri,
    grant_type: 'authorization_code',
  };
  return axios
    .post(rootUrl, querystring.stringify(options), {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      console.error('get google user token error', err);
    });
}

router.get('/google/login', (req, res) => {
  res.redirect(getGoogleLoginURI());
});

router.get('/google', async (req, res) => {
  const code = req.query.code;
  const { id_token, access_token, expires_in, token_type, scope, refresh_token } = await getGoogleUserToken({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: `${process.env.SERVER_ROOT_URI}${process.env.GOOGLE_REDIRECT_URI}`,
  });
  const user = await axios
    .get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      console.error('get google user info error', err);
    });
  console.log(id_token, access_token, expires_in, token_type, scope, refresh_token, user);
  res.cookie(process.env.COOKIE_NAME_REFRESH_TOKEN, refresh_token, {
    maxAge: expires_in * 1000,
    httpOnly: true,
    secure: false,
  });
  res.redirect(process.env.CLIENT_ROOT_URI);
});

function getKakaoLoginURI() {
  const rootUrl = `https://kauth.kakao.com/oauth/authorize`;
  const options = {
    client_id: process.env.KAKAO_CLIENT_ID,
    redirect_uri: `${process.env.SERVER_ROOT_URI}${process.env.KAKAO_REDIRECT_URI}`,
    response_type: 'code',
    prompt: 'none',
  };
  return `${rootUrl}?${querystring.stringify(options)}`;
}

function getKakaoUserToken({ code, client_id, client_secret, redirect_uri }) {
  const rootUrl = 'https://kauth.kakao.com/oauth/token';
  const options = {
    code,
    client_id,
    client_secret,
    redirect_uri,
    grant_type: 'authorization_code',
  };
  return axios
    .post(rootUrl, querystring.stringify(options), {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      console.error('get kakao user token error', err);
    });
}

router.get('/kakao/login', (req, res) => {
  res.redirect(getKakaoLoginURI());
});

router.get('/kakao', async (req, res) => {
  const code = req.query.code;
  const { access_token, expires_in, token_type, scope, refresh_token, refresh_token_expires_in } =
    await getKakaoUserToken({
      code,
      client_id: process.env.KAKAO_CLIENT_ID,
      client_secret: process.env.KAKAO_CLIENT_SECRET,
      redirect_uri: `${process.env.SERVER_ROOT_URI}${process.env.KAKAO_REDIRECT_URI}`,
    });
  const user = await axios
    .get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      console.error('get kakao user info error', err);
    });
  console.log(access_token, expires_in, token_type, scope, refresh_token, refresh_token_expires_in, user);
  res.cookie(process.env.COOKIE_NAME_REFRESH_TOKEN, refresh_token, {
    maxAge: refresh_token_expires_in * 1000,
    httpOnly: true,
    secure: false,
  });
  res.redirect(process.env.CLIENT_ROOT_URI);
});

router.get('/me', (req, res) => {
  const data = {};
  res.json(JSON.stringify(data));
});

module.exports = router;
