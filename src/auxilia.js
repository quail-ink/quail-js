import { sendRequest, sendRequestFormData } from './common'

export class AuxiliaClient{
  apibase = '';
  apikey = '';
  access_token = '';
  debug = false;

	constructor(opts) {
    this.apikey = opts.apikey || "";
    this.access_token = opts.access_token || "";
    this.apibase = opts.apibase || "https://api.quail.ink";
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
    return this.request(`/subscriptions/${list_id}/upgrade?approach=${approach}&redirect_url=${redirect_url}&plan=${plan}&dur=${dur}`, 'POST', null)
  }

  // read orders
  getMyOrders(offset, limit) {
    const url = `/orders/me?offset=${offset}&limit=${limit}`
    return this.request(url, 'GET', null)
  }

  getListOrders(list_id, offset, limit) {
    const url = `/orders/lists/${list_id}?offset=${offset}&limit=${limit}`
    return this.request(url, 'GET', null)
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

  updateListPayments(list_id) {
    return this.request(`/lists/${list_id}/payments`, 'PUT', payload)
  }

  // Abuse Reports
  getAbuseReportOpponent(trace_id) {
    return this.request(`/reports/opponent?trace_id=${trace_id}`, 'GET', null)
  }

  createAbuseReport(payload, ctoken) {
    return this.request(`/reports`, 'POST', {
      'challenge-action': 'abuse-report',
      'challenge-token': ctoken,
      ...payload,
    })
  }
}

