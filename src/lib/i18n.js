
function detectLang() {
  const queryLang =
    new URL(window.location.href).searchParams.get("lang") || "";
  if (queryLang) {
    return queryLang;
  }

  let lang = localStorage.getItem("quail-language");
  if (lang && messages[lang]) {
    return lang;
  }

  lang = navigator.language.toLowerCase();
  if (lang.length > 5) {
    lang = lang.substring(0, 5);
  }

  if (lang && messages[lang]) {
    return lang;
  } else {
    lang = lang.substring(0, 2);
    if (lang && messages[lang]) {
      return lang;
    }
    return "en";
  }
}

function t(name, data) {
  const lang = detectLang();
  const locale = messages[lang];
  let msg = "";

  if (locale) {
    msg = locale[name];
    if (typeof msg === "undefined") {
      msg = messages.en[name];
      if (typeof msg === "undefined") {
        msg = name;
      }
    }
  }

  if (data) {
    for (const key in data) {
      msg = msg.replace(`{${key}}`, data[key]);
    }
  }

  return msg;
}

export {
  t,
  detectLang,
}