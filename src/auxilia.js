import { sendRequest, sendRequestFormData, getAccessTokenFromEnv } from './common'

export class AuxiliaClient{
  apibase = '';
  apikey = '';
  access_token = '';
  debug = false;

	constructor(opts) {
    this.apikey = opts.apikey || "";
    this.access_token = opts.access_token || "";
    this.apibase = opts.apibase || "https://api.quail.ink/auxilia";
    this.debug = opts.debug || false;
	}

  getAccessToken() {
    let token = this.access_token;
    if (token === '') {
      token = getAccessTokenFromEnv()
    }
    return token;
  }

  async request(url, method, body) {
    url = this.apibase + url;
    const headers = {
      'Content-Type': 'application/json',
    }

    // try to use token from environment
    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (this.apikey) {
      headers['X-QUAIL-KEY'] = this.apikey;
    }

    if (this.debug) {
      console.log(`request: ${method} ${url}`);
      console.log("- headers", headers);
      console.log("- body", body);
    }

    return sendRequest(url, method, headers, body);
  }

  async requestFormData (url, body) {
    url = this.apibase + url;
    const headers = {};

    // try to use token from environment
    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (this.apikey) {
      headers['X-QUAIL-KEY'] = this.apikey;
    }

    if (this.debug) {
      console.log(`request: POST ${url}`);
      console.log("- headers", headers);
      console.log("- body", body);
    }

    return sendRequestFormData(url, headers, body);
  }

  getConfig() {
    return this.request(`/c`, 'GET', null)
  }

  // place orders
  placeSubscriptionOrder(list_id, approach = "mixpay", redirect_url = "", plan="silver", dur=365) {
    // default dur = 365 days
    return this.request(`/orders/lists/${list_id}/upgrade?approach=${approach}&redirect_url=${redirect_url}&plan=${plan}&dur=${dur}`, 'POST', null)
  }

  // read orders
  getOrder(id) {
    const url = `/orders/${id}`
    return this.request(url, 'GET', null)
  }

  getMyOrders(offset, limit) {
    const url = `/orders/me?offset=${offset}&limit=${limit}`
    return this.request(url, 'GET', null)
  }

  getListOrders(list_id, offset, limit) {
    const url = `/orders/lists/${list_id}?offset=${offset}&limit=${limit}`
    return this.request(url, 'GET', null)
  }

  // subscriptions
  modSubscriptionMember(list_id, member_id, payload) {
    const url = `/subscriptions/${list_id}/members/${member_id}`;
    return this.request(url, 'PUT', payload)
  }

  // List Incomes List
  getListIncomes(list_id, year) {
    const url = `/lists/${list_id}/incomes?year=${year}`
    return this.request(url, 'GET', null)
  }

  // Payments Settings
  getListPayments(list_id) {
    return this.request(`/lists/${list_id}/payments`, 'GET', null)
  }

  // @TODO: remove
  updateListPayments(list_id, payload) {
    return this.request(`/lists/${list_id}/payments`, 'PUT', payload)
  }

  updateListCryptoPayments(list_id, payload) {
    return this.request(`/lists/${list_id}/payments/crypto`, 'PUT', payload)
  }

  updateListFiatPayments(list_id, payload) {
    return this.request(`/lists/${list_id}/payments/fiat`, 'PUT', payload)
  }

  // Payouts
  getPayout() {
    return this.request(`/payouts`, 'GET', null)
  }

  // Payouts - Stripe
  connectToStripe(country) {
    return this.request(`/stripe/express?country=${country}`, 'POST', null)
  }

  genStripeLoginURL() {
    return this.request(`/stripe/express/login`, 'POST', null)
  }

  // Payouts - Crypto
  updateCryptoPayout(payload) {
    return this.request(`/payouts/crypto`, 'PUT', payload)
  }

  registerEvm(network) {
    return this.request(`/payouts/evm/register?network=${network}`, 'POST')
  }

  unregisterEvm(network) {
    return this.request(`/payouts/evm/unregister?network=${network}`, 'POST')
  }

  // utils
  proxyToDiscord(pathname, query) {
    return this.request(`/proxy/discord?pathname=${pathname}&query=${encodeURIComponent(query)}`, 'GET', null)
  }

  // Abuse Reports
  getAbuseReportOpponent(trace_id) {
    return this.request(`/reports/opponent?trace_id=${trace_id}`, 'GET', null)
  }

  // crypto
  getCryptos() {
    return this.request(`/cryptos`, 'GET', null)
  }

  getCrypto(symbol) {
    return this.request(`/cryptos/${symbol}`, 'GET', null)
  }

  // country
  getCountries() {
    return this.request(`/countries`, 'GET', null)
  }

  getCountryByAlpha2(code) {
    return this.request(`/countries/alpha-2/${code}`, 'GET', null)
  }

  createAbuseReport(payload, ctoken) {
    return this.request(`/reports`, 'POST', {
      'challenge-action': 'abuse-report',
      'challenge-token': ctoken,
      ...payload,
    })
  }
}

