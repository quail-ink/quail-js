export class Client{
  apibase = '';
  apikey = '';
  access_token = '';
  debug = false;

	constructor(opts: any) {
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
      token = (window as any)._access_token;
    }

    return token;
  }

  async request(url: string, method: string, body: any): Promise<any> {
    url = this.apibase + url;
    const headers:Record<string, string> = {
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

    const resp = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const json = await resp.json();

    if (this.debug) {
      console.log("resp json", json);
    }

    if (json.code) {
      console.log("quail client error", json.code, json.message || json.msg);
      throw new Error(`${json.code} | ${json.message || json.msg} | ${method} ${url}`);
    }
    return json.data;
  }

  async requestFormData (url: string, body: any): Promise<any> {
    url = this.apibase + url;
    const headers:Record<string, string> = {};

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

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: body || null,
    });

    const json = await resp.json();

    if (this.debug) {
      console.log("resp json", json);
    }

    if (json.code) {
      console.log("quail client error", json.code, json.message || json.msg);
      throw new Error(`${json.code} | ${json.message || json.msg} | POST ${url}`);
    }
    return json.data || { code: json?.code, message: json?.message };
  }

  getAuthCode(email: string, ctoken: string): Promise<any> {
    let lang = navigator.language;
    if (lang.length > 2) {
      lang = lang.substring(0, 2);
    }

    return this.request(`/auth/code`, 'POST', {
      email, lang,
      'challenge-action': 'request_auth_code',
      'challenge-token': ctoken,
    })
  }

  login(email: string, code: string): Promise<any> {
    let lang = navigator.language;
    if (lang.length > 2) {
      lang = lang.substring(0, 2);
    }

    return this.request(`/auth/login`, 'POST', {
      "method": "email_code",
      "email": email,
      "code": code,
      "lang": lang
    })
  }

  issueEphemeralToken(origin: string): Promise<any> {
    return this.request(`/auth/ephemeral?origin=${origin}`, 'POST', null)
  }

  exchangeAccessTokenWithEphemeral(token: string): Promise<any> {
    return this.request(`/auth/ephemeral/exchange?token=${token}`, 'POST', null)
  }

  getConfig(): Promise<any> {
    return this.request(`/c`, 'GET', null)
  }

  getCurrencies(): Promise<any> {
    return this.request(`/currencies`, 'GET', null)
  }

  getCurrency(code: string): Promise<any> {
    return this.request(`/currencies/${code}`, 'GET', null)
  }

  getAssets(): Promise<any> {
    return this.request(`/assets`, 'GET', null)
  }

  getAsset(assetId: string): Promise<any> {
    return this.request(`/assets/${assetId}`, 'GET', null)
  }

  getMe(): Promise<any> {
    return this.request(`/users/me`, 'GET', null)
  }

  updateMe(profile: any): Promise<any> {
    return this.request(`/users/me`, 'PUT', profile)
  }

  getUser(user_id: number): Promise<any> {
    return this.request(`/users/${user_id}`, 'GET', null)
  }

  getUserLists(user_id: number): Promise<any> {
    return this.request(`/users/${user_id}/lists`, 'GET', null)
  }

  subscribe(list_id: number | string, email: string, ctoken: string): Promise<any> {
    return this.request(`/subscriptions/${list_id}`, 'POST', {
      email,
      'challenge-action': 'subscribe',
      'challenge-token': ctoken,
    })
  }

  batchAddSubscribers(list_id: number | string, members: any[], ctoken: string): Promise<any> {
    return this.request(`/subscriptions/${list_id}/add-members`, 'POST', {
      'challenge-action': 'subscribe',
      'challenge-token': ctoken,
      'members': members,
    })
  }

  updateSubscriber(list_id: number | string, member_id: number, payload: any): Promise<any> {
    return this.request(`/subscriptions/${list_id}/members/${member_id}`, 'PUT', payload)
  }

  deleteSubscriber(list_id: number | string, member_id: number): Promise<any> {
    return this.request(`/subscriptions/${list_id}/members/${member_id}`, 'DELETE', null)
  }

  getMySubscriptions(): Promise<any> {
    return this.request(`/subscriptions`, 'GET', null)
  }

  getMySubscription(list_id: number | string): Promise<any> {
    return this.request(`/subscriptions/${list_id}/rel`, 'GET', null)
  }

  subscribeNoChallenge(list_id: number | string): Promise<any> {
    return this.request(`/subscriptions/${list_id}/no-challenge`, 'POST', null)
  }

  unsubscribe(list_id: number | string, trace_id = ""): Promise<any> {
    return this.request(`/subscriptions/${list_id}`, 'DELETE', { trace_id })
  }

  getListPosts(list_id: number | string, offset = 0, limit = 16, pub = false, sort=''): Promise<any> {
    let url = `/lists/${list_id}/posts?offset=${offset}&limit=${limit}`
    if (pub) {
      url += `&public=1`
    }
    if (sort) {
      url += `&sort=${sort}`
    }
    return this.request(url, 'GET', null)
  }

  getListDelivery(list_id: number | string, offset = 0, limit = 10): Promise<any> {
    return this.request(`/lists/${list_id}/delivery?offset=${offset}&limit=${limit}`, 'GET', null)
  }

  cancelScheduledDelivery(list_id: number | string, delivery_id: number): Promise<any> {
    return this.request(`/lists/${list_id}/delivery/${delivery_id}/cancel`, 'PUT', null)
  }

  getPinnedPosts(list_id: number | string): Promise<any> {
    return this.request(`/lists/${list_id}/pinned`, 'GET', null)
  }

  pinPosts(list_id:number, ids: number[]): Promise<any> {
    return this.request(`/lists/${list_id}/pinned`, 'PUT', { ids })
  }

  getPost(list_id: number | string, post_id: number | string): Promise<any> {
    return this.request(`/lists/${list_id}/posts/${post_id}`, 'GET', null)
  }

  deletePost(list_id: number | string, post_id: number | string): Promise<any> {
    return this.request(`/lists/${list_id}/posts/${post_id}`, 'DELETE', null)
  }

  getPostContent(list_id: number | string, post_id: number | string): Promise<any> {
    return this.request(`/lists/${list_id}/posts/${post_id}/content`, 'GET', null)
  }

  createList(payload: any): Promise<any> {
    return this.request(`/lists`, 'POST', payload)
  }

  getLists(user_id: number | string): Promise<any> {
    return this.request(`/users/${user_id}/lists`, 'GET', null)
  }

  getList(list_id: number | string): Promise<any> {
    return this.request(`/lists/${list_id}`, 'GET', null)
  }

  getListByDomain(domain: number | string): Promise<any> {
    return this.request(`/lists/domains/${domain}`, 'GET', null)
  }

  getListMetrics(list_id: number | string): Promise<any> {
    return this.request(`/lists/${list_id}/metrics`, 'GET', null)
  }

  updateList(list_id: number | string, payload:any): Promise<any> {
    return this.request(`/lists/${list_id}`, 'PUT', {
      "avatar_image_url": payload.avatar_image_url || '',
      "title": payload.title || '',
      "description": payload.description || '',
    })
  }

  updateListChannel(list_id: number | string, payload:any): Promise<any> {
    return this.request(`/lists/${list_id}/channel`, 'PUT', payload)
  }

  getListChannel(list_id: number | string): Promise<any> {
    return this.request(`/lists/${list_id}/channel`, 'GET', null)
  }

  createListChannelLineKeys(list_id: number | string): Promise<any> {
    return this.request(`/lists/${list_id}/channel/line/keys`, 'POST', null)
  }

  updateListAnalytics(list_id: number | string, payload:any): Promise<any> {
    return this.request(`/lists/${list_id}/analytics`, 'PUT', payload)
  }

  updateListEmailSettings(list_id: number | string, payload:any): Promise<any> {
    if (payload.email_signature_text.length > 2048) {
      payload.email_signature_text = payload.email_signature_text.substring(0, 2048)
    }
    if (payload.email_onboarding_text.length > 2048) {
      payload.email_onboarding_text = payload.email_onboarding_text.substring(0, 2048)
    }
    return this.request(`/lists/${list_id}/email_settings`, 'PUT', {
      "email_channel_enabled": payload.email_channel_enabled,
      "email_deny_list": payload.email_deny_list || [],
      "email_onboarding_text": payload.email_onboarding_text || "",
      "email_signature_text": payload.email_signature_text || "",
    })
  }

  updateListSlug(list_id: number | string, slug:string): Promise<any> {
    return this.request(`/lists/${list_id}/slug?slug=${slug}`, 'PUT', null)
  }

  updateListDomain(list_id: number | string, payload:any): Promise<any> {
    return this.request(`/lists/${list_id}/domain`, 'PUT', payload)
  }

  updateListComment(list_id: number | string, payload:any): Promise<any> {
    return this.request(`/lists/${list_id}/comment`, 'PUT', payload)
  }

  getListSubscriptions(list_id: number | string, offset: number, limit: number, email = "", premium = ""): Promise<any> {
    let url = `/lists/${list_id}/subscriptions?offset=${offset}&limit=${limit}`
    if (email) {
      url += `&email=${encodeURIComponent(email)}`
    }
    if (premium) {
      url += `&premium=${premium}`
    }
    return this.request(url, 'GET', null)
  }

  getApikeys(): Promise<any> {
    return this.request(`/apikeys`, 'GET', null)
  }

  deleteApikey(id: number): Promise<any> {
    return this.request(`/apikeys/${id}`, 'DELETE', null)
  }

  createApikey(name: string): Promise<any> {
    return this.request(`/apikeys`, 'POST', {
      name,
    })
  }

  generateFrontmatter (title: string, content: string, includes: string[] = []): Promise<any> {
    let url = `/composer/frontmatter`
    if (includes.length > 0) {
      url = `${url}?includes=${includes.map(x => encodeURIComponent(x.toLowerCase())).join(',')}`
    }
    return this.request(url, 'POST', {
      title, content
    });
  }

  generateMetadata (title: string, content: string, includes: string[] = []): Promise<any> {
    let url = `/composer/metadata`
    if (includes.length > 0) {
      url = `${url}?includes=${includes.map(x => encodeURIComponent(x.toLowerCase())).join(',')}`
    }
    return this.request(url, 'POST', {
      title, content
    });
  }

  generateTweets (title: string, content: string): Promise<any> {
    let url = `/composer/generate-tweets`
    return this.request(url, 'POST', {
      title, content
    });
  }

  searchPhotos (query: string, page = 1, limit = 10): Promise<any> {
    query = encodeURIComponent(query)
    return this.request(`/composer/unsplash/photos/search?query=${query}&page=${page}&limit=${limit}`, 'GET', null);
  }

  getPhotoDownloadUrl (endpoint: string): Promise<any> {
    endpoint = encodeURIComponent(endpoint)
    return this.request(`/composer/unsplash/photos/download_url?endpoint=${endpoint}`, 'GET', null);
  }

  createPost (listID: any, payload:any): Promise<any> {
    return this.request(`/lists/${listID}/posts`, 'POST', payload)
  }

  updatePost (listID: any, postID:any, payload:any): Promise<any> {
    return this.request(`/lists/${listID}/posts/${postID}/update`, 'PUT', payload)
  }

  updatePostOptions (listID: any, postID:any, payload:any): Promise<any> {
    return this.request(`/lists/${listID}/posts/${postID}/options`, 'PUT', payload)
  }

  publishPost (listID: any, slug:any): Promise<any> {
    return this.request(`/lists/${listID}/posts/${slug}/publish`, 'PUT', null)
  }

  unpublishPost (listID: any, slug:any): Promise<any> {
    return this.request(`/lists/${listID}/posts/${slug}/unpublish`, 'PUT', null)
  }

  deliverPost (listID: any, slug:any, scheduledAt): Promise<any> {
    let payload = null;
    if (scheduledAt) {
      payload = {
        scheduled_at: scheduledAt,
      }
    }
    return this.request(`/lists/${listID}/posts/${slug}/deliver`, 'PUT', payload)
  }

  createPostPreviewToken (listID: any, slug:any): Promise<any> {
    return this.request(`/lists/${listID}/posts/${slug}/preview`, 'POST', null)
  }

  getPostPreviewUrl (listID: any, slug:any, token: string): string {
    return `${this.apibase}/lists/${listID}/posts/${slug}/preview?access_token=${token}`
  }

  uploadAttachment(formData: FormData): Promise<any> {
    return this.requestFormData(`/attachments`, formData);
  }

  incCount(post_id, field): Promise<any>  {
    return this.request(`/posts/${field}?id=${post_id}`, 'POST', null)
  }

  getPostsOfMySubscriptions(offset = 0, limit = 16): Promise<any>  {
    return this.request(`/posts/subscribed?offset=${offset}&limit=${limit}`, 'GET', null)
  }

  getExploreTrendingPosts(offset = 0, limit = 16, lang=''): Promise<any> {
    let url = `/explore/trending/posts?offset=${offset}&limit=${limit}`
    if (lang) {
      url += `&lang=${lang}`
    }
    return this.request(url, 'GET', null)
  }

  getExploreTrendingLists(offset = 0, limit = 16, lang=''): Promise<any> {
    let url = `/explore/trending/lists?offset=${offset}&limit=${limit}`
    if (lang) {
      url += `&lang=${lang}`
    }
    return this.request(url, 'GET', null)
  }

  getAbuseReportOpponent(trace_id: string): Promise<any> {
    return this.request(`/reports/opponent?trace_id=${trace_id}`, 'GET', null)
  }

  createAbuseReport(payload: any, ctoken: string): Promise<any> {
    return this.request(`/reports`, 'POST', {
      'challenge-action': 'abuse-report',
      'challenge-token': ctoken,
      ...payload,
    })
  }

  getComments(post_id: number, offset = 0, limit = 16): Promise<any> {
    return this.request(`/comments?post_id=${post_id}&offset=${offset}&limit=${limit}`, 'GET', null)
  }

  getCommentsByList(list_id: number, offset = 0, limit = 16): Promise<any> {
    return this.request(`/comments?list_id=${list_id}&offset=${offset}&limit=${limit}`, 'GET', null)
  }

  createComment(payload: any): Promise<any> {
    return this.request(`/comments`, 'POST', payload)
  }

  deleteComment(comment_id: number): Promise<any> {
    return this.request(`/comments/${comment_id}`, 'DELETE', null)
  }

  approveComment(comment_id: number): Promise<any> {
    return this.request(`/comments/${comment_id}/approve`, 'PUT', null)
  }

  rejectComment(comment_id: number): Promise<any> {
    return this.request(`/comments/${comment_id}/reject`, 'PUT', null)
  }

  // obsolete
  getMyOrders(offset: number, limit: number): Promise<any> {
    let url = `/users/me/orders?offset=${offset}&limit=${limit}`
    return this.request(url, 'GET', null)
  }

  getOrder(order_id: number): Promise<any> {
    let url = `/orders/${order_id}`
    return this.request(url, 'GET', null)
  }

  upgradeSubscription(list_id: number | string, approach = "mixpay", redirect_url = "", plan="silver", dur=365): Promise<any> {
    // default dur = 365 days
    return this.request(`/subscriptions/${list_id}/upgrade?approach=${approach}&redirect_url=${redirect_url}&plan=${plan}&dur=${dur}`, 'POST', null)
  }

  getListOrders(list_id: number | string, offset: number, limit: number): Promise<any> {
    let url = `/lists/${list_id}/orders?offset=${offset}&limit=${limit}`
    return this.request(url, 'GET', null)
  }

  getListIncomes(list_id: number | string, year: number): Promise<any> {
    let url = `/lists/${list_id}/incomes?year=${year}`
    return this.request(url, 'GET', null)
  }

  getListPayments(list_id: number | string): Promise<any> {
    return this.request(`/lists/${list_id}/payments`, 'GET', null)
  }

  updateListPayments(list_id: number | string, payload:any): Promise<any> {
    return this.request(`/lists/${list_id}/payments`, 'PUT', payload)
  }

}

