
function getAccessTokenFromEnv() {
  let token = '';
  const auth = localStorage.getItem('auth');
  if (auth) {
    try {
      const authObj = JSON.parse(auth);
      token = authObj.access_token || authObj.token || '';
    } catch (e) {
      token = '';
    }
  }

  if (token === '') {
    token = window._access_token || '';
  }

  return token;
}

function getProfile() {
  const auth = localStorage.getItem("auth");
  if (auth) {
    try {
      const authObj = JSON.parse(auth);
      return authObj.profile || null;
    } catch (e) {
      return null;
    }
  }
  return null;
}

function isLogged() {
  return getAccessTokenFromEnv() !== "";
}

async function loginByExchangingToken(client, epToken) {
  const resp = await client.exchangeAccessTokenWithEphemeral(epToken);
  if (resp.access_token) {
    updateEnvToken(resp.access_token);
  }
  return { profile: resp.user, token: resp.access_token };
}

async function updateEnvToken(token) {
  const authStr = localStorage.getItem('auth');
  let authObj = {};
  if (authStr) {
    try {
      authObj = JSON.parse(auth);
      authObj.access_token = token;
    } catch (e) {
      console.warn('Failed to parse auth object, use fallback one', e);
      authObj = { access_token: token };
    }
  }
  localStorage.setItem('auth', JSON.stringify(authObj));
}

async function verify(client) {
  if (isLogged()) {
    try {
      const m = await client.getMe()
      return m;
    } catch (e) {
      logout();
      return null;
    }
  }
  return null;
}

function logout() {
  localStorage.removeItem('auth');
}


export {
  getAccessTokenFromEnv,
  getProfile,
  isLogged,
  updateEnvToken,
  loginByExchangingToken,
  verify,
  logout,
};