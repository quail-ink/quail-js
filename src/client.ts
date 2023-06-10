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
    if (json.code) {
      console.log("error", json.code, json.message || json.msg);
      throw new Error(`${json.code}: ${json.message || json.msg}`);
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

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: body || null,
    });
    const json = await resp.json();
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

  subscribe(list_id: number | string, email: string, ctoken: string): Promise<any> {
    return this.request(`/subscriptions/${list_id}`, 'POST', {
      email,
      'challenge-action': 'subscribe',
      'challenge-token': ctoken,
    })
  }

  getMySubscriptions(): Promise<any> {
    return this.request(`/subscriptions`, 'GET', null)
  }

  subscribeNoChallenge(list_id: number | string): Promise<any> {
    return this.request(`/subscriptions/${list_id}/no-challenge`, 'POST', null)
  }

  unsubscribe(list_id: number | string, trace_id = ""): Promise<any> {
    return this.request(`/subscriptions/${list_id}`, 'DELETE', { trace_id })
  }

  upgradeSubscription(list_id: number | string, redirect_url = "", plan="paid-yearly"): Promise<any> {
    return this.request(`/subscriptions/${list_id}/upgrade?redirect_url=${redirect_url}&plan=${plan}`, 'POST', null)
  }

  getListPosts(list_id: number | string, offset = 0, limit = 10): Promise<any> {
    return this.request(`/lists/${list_id}/posts?offset=${offset}&limit=${limit}`, 'GET', null)
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

  getPostContent(list_id: number | string, post_id: number | string): Promise<any> {
    return this.request(`/lists/${list_id}/posts/${post_id}/content`, 'GET', null)
  }

  getLists(user_id: number | string): Promise<any> {
    return this.request(`/users/${user_id}/lists`, 'GET', null)
  }

  getList(list_id: number | string): Promise<any> {
    return this.request(`/lists/${list_id}`, 'GET', null)
  }

  updateList(list_id: number | string, payload:any): Promise<any> {
    return this.request(`/lists/${list_id}`, 'PUT', {
      "avatar_image_url": payload.avatar_image_url || '',
      "title": payload.title || '',
      "description": payload.description || '',
    })
  }

  updateListTelegram(list_id: number | string, payload:any): Promise<any> {
    return this.request(`/lists/${list_id}/telegram`, 'PUT', {
      "telegram_bot_token": payload.telegram_bot_token || '',
      "telegram_channel_id": payload.telegram_channel_id || '',
    })
  }

  updateListSlug(list_id: number | string, slug:string): Promise<any> {
    return this.request(`/lists/${list_id}?slug=${slug}`, 'PUT', null)
  }

  getListSubscriptions(list_id: number | string, offset: number, limit: number): Promise<any> {
    return this.request(`/lists/${list_id}/subscriptions?offset=${offset}&limit=${limit}`, 'GET', null)
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

  async generateFrontmatter (title: string, content: string): Promise<any> {
    return this.request(`/composer/frontmatter`, 'POST', {
      title, content
    });
  }

  async generateMetadata (title: string, content: string): Promise<any> {
    return this.request(`/composer/metadata`, 'POST', {
      title, content
    });
  }

  async searchPhotos (query: string, page = 1, limit = 10): Promise<any> {
    query = encodeURIComponent(query)
    return this.request(`/composer/unsplash/photos/search?query=${query}&page=${page}&limit=${limit}`, 'GET', null);
  }

  async getPhotoDownloadUrl (endpoint: string): Promise<any> {
    endpoint = encodeURIComponent(endpoint)
    return this.request(`/composer/unsplash/photos/download_url?endpoint=${endpoint}`, 'GET', null);
  }

  async createPost (listID: any, payload:any): Promise<any> {
    return this.request(`/lists/${listID}/posts`, 'POST', payload)
  }

  async updatePost (listID: any, postID:any, payload:any): Promise<any> {
    return this.request(`/lists/${listID}/posts/${postID}/update`, 'PUT', payload)
  }

  async publishPost (listID: any, slug:any): Promise<any> {
    return this.request(`/lists/${listID}/posts/${slug}/publish`, 'PUT', null)
  }

  async unpublishPost (listID: any, slug:any): Promise<any> {
    return this.request(`/lists/${listID}/posts/${slug}/unpublish`, 'PUT', null)
  }

  async deliverPost (listID: any, slug:any): Promise<any> {
    return this.request(`/lists/${listID}/posts/${slug}/deliver`, 'PUT', null)
  }

  async uploadAttachment(formData: FormData): Promise<any>  {
    return await this.requestFormData(`/attachments`, formData);
  }

  async view(post_id) {
    return this.request(`/posts/view?id=${post_id}`, 'POST', null)
  }
}

