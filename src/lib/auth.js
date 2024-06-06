
function getAccessTokenFromEnv() {
  let token = '';
  const auth = localStorage.getItem('auth');
  if (auth) {
    try {
      const authObj = JSON.parse(auth);
      token = authObj.access_token || authObj.token;
    } catch (e) {
      token = '';
    }
  }

  if (token === '') {
    token = window._access_token;
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

export {
  getAccessTokenFromEnv,
  getProfile,
  isLogged,
};