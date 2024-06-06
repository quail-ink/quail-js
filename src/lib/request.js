async function sendRequest(url, method, headers, body) {
  headers['Content-Type'] = 'application/json'

  const resp = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const json = await resp.json();

  if (json.code) {
    console.error("[quailjs.request] client error", json.code, json.message || json.msg);
    throw new Error(`${json.code} | ${json.message || json.msg} | ${method} ${url}`);
  }
  return json.data;
}

async function sendRequestFormData (url, headers, body) {
  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: body || null,
  });

  const json = await resp.json();

  if (json.code) {
    console.error("[quailjs.request] client error", json.code, json.message || json.msg);
    throw new Error(`${json.code} | ${json.message || json.msg} | POST ${url}`);
  }


  return json.data || { code: json?.code, message: json?.message };
}

export { sendRequest, sendRequestFormData };

