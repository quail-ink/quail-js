import { sendRequest, sendRequestFormData } from './common'

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
      const auth = localStorage.getItem('auth');
      if (auth) {
        try {
          const authObj = JSON.parse(auth);
          token = authObj.access_token || authObj.token;
        } catch (e) {
          token = '';
        }
      }
    }

    if (token === '') {
      token = window._access_token;
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
      headers['X-QUAIL-Key'] = this.apikey;
    }

    if (this.debug) {
      console.log("request method", method);
      console.log("request url", url);
      console.log("request headers", headers);
      console.log("request body", body);
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
      headers['X-QUAIL-Key'] = this.apikey;
    }

    if (this.debug) {
      console.log("request url", url);
      console.log("request headers", headers);
      console.log("request body", body);
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

  updateListPayments(list_id, payload) {
    return this.request(`/lists/${list_id}/payments`, 'PUT', payload)
  }

  // Payouts
  getPayout() {
    return this.request(`/payouts`, 'GET', null)
  }

  connectToStripe() {
    return this.request(`/stripe/express`, 'POST', null)
  }

  genStripeLoginURL() {
    return this.request(`/stripe/express/login`, 'POST', null)
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

  createAbuseReport(payload, ctoken) {
    return this.request(`/reports`, 'POST', {
      'challenge-action': 'abuse-report',
      'challenge-token': ctoken,
      ...payload,
    })
  }
}

