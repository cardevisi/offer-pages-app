(function () {
  const platformMappings = {
    adcombo: {
      clickid: "gclid",
      subacc: "pixel",
      subacc3: "device",
      subacc4: "matchtype",
      subacc2: "keyword",
    },
    buygoods: {
      subid2: "gclid",
      subid: "pixel",
      subid3: "device",
      subid4: "matchtype",
      subid5: "keyword",
    },
    clickbank: {
      tid: "gclid",
      extclid: "gclid",
      ext_clid: "gclid",
      aff_sub1: "pixel",
      aff_sub3: "device",
      aff_sub4: "matchtype",
      aff_sub2: "keyword",
    },
    digistore24: {
      cid: "gclid",
      sid1: "pixel",
      sid3: "device",
      sid4: "matchtype",
      sid2: "keyword",
    },
    gurumedia: {
      sub2: "gclid",
      sub1: "pixel",
      sub3: "device",
      sub4: "matchtype",
      sub5: "keyword",
    },
    maxweb: {
      subid2: "gclid",
      subid: "pixel",
      subid3: "device",
      subid4: "matchtype",
      subid5: "keyword",
    },
    smartadv: {
      sub2: "gclid",
      sub1: "pixel",
      sub3: "device",
      sub4: "matchtype",
      sub5: "keyword",
    },
    webvork: {
      utm_campaign: "gclid",
      utm_medium: "pixel",
      utm_content: "device",
      utm_term: "matchtype",
    },
    drcash: {
      sub2: "gclid",
      sub1: "pixel",
      sub3: "device",
      sub4: "matchtype",
      sub5: "keyword",
    },
    terraleads: {
      sub_id_1: "gclid",
      sub_id: "pixel",
      sub_id_2: "device",
      sub_id_3: "matchtype",
      sub_id_4: "keyword",
    },
    trafficlight: {
      utm_medium: "gclid",
      utm_source: "pixel",
      utm_campaign: "device",
      utm_content: "matchtype",
      utm_term: "keyword",
    },
    nutriprofits: {
      param_2: "gclid",
      param: "pixel",
      param_3: "device",
      param_4: "matchtype",
    },
    sellhealth: {
      t2: "gclid",
      t1: "pixel",
      t3: "device",
      t4: "matchtype",
      t5: "keyword",
    },
    shakespro: {
      sub2: "gclid",
      sub1: "pixel",
      sub3: "device",
      sub4: "matchtype",
      sub5: "keyword",
    },
    clickhunts: {
      sub2: "gclid",
      sub1: "pixel",
      sub3: "device",
      sub4: "matchtype",
      sub5: "keyword",
    },
  };
  // Função para pegar o valor de um parâmetro específico na URL
  const searchParams = new URLSearchParams(window.location.search);

  function getParameterByName(name) {
    const url = window.location.href;
    const nameEscaped = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + nameEscaped + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results || !results[2]) return null;
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  // Capturando os valores reais dos parâmetros na URL da página atual
  const gclid = searchParams.get("gclid") ?? "gclid"; //encodeURIComponent(String(getParameterByName("gclid"))); // Codificando para URL
  const keyword = searchParams.get("keyword") ?? "key_0"; //encodeURIComponent(String(getParameterByName("keyword") ?? "key_0")); // Codificando para URL
  const matchtype = searchParams.get("matchtype") ?? "mt_0"; //encodeURIComponent(String(getParameterByName("matchtype") ?? "mt_0")); // Codificando para URL
  const device = searchParams.get("device") ?? "d_0"; //encodeURIComponent(String(getParameterByName("device") ?? "d_0")); // What device the click came from: "m" for mobile (including WAP), "t" for tablet, and "c" for computer. // Codificando para URL

  function getPlatform() {
    const platformLinks = document.querySelectorAll(
      'a[href*="source_id="], a[href*="tid="], a[href]'
    );
    for (const link of platformLinks) {
      const url = new URL(link.href);
      const sourceId = url.searchParams.get("source_id");
      if (sourceId && platformMappings[sourceId]) {
        return sourceId;
      }
      const tid = url.searchParams.get("tid");
      if (tid === url.searchParams.get("tid")) {
        return tid;
      }
    }
    return null;
  }

  function smartAdvUpdateLinks() {
    // Captura todos os links da página que possuam o parâmetro 'sub1'
    const links = document.querySelectorAll('a[href*="source_id="], a[href]');

    // Loop através de cada link
    links.forEach((link) => {
      const url = new URL(link.href);

      // Substitui os valores dos parâmetros conforme o mapeamento
      url.searchParams.set("sub1", keyword);
      url.searchParams.set("sub2", gclid);
      url.searchParams.set("sub3", device);
      url.searchParams.set("sub4", matchtype);
      url.searchParams.set("sub5", keyword);

      // Atualiza o href do link com a nova URL
      link.href = url.toString();

      console.log(`Link atualizado: ${link.href}`);
    });
  }

  // Função para atualizar todos os links na página
  function clickbankUpdateLinks() {
    // Captura todos os links da página que possuam o parâmetro 'tid'
    const links = document.querySelectorAll('a[href*="tid="], a[href]');

    // Loop através de cada link
    links.forEach((link) => {
      const url = new URL(link.href);

      // Substitui o valor do parâmetro 'tid'
      url.searchParams.set("tid", "gads");
      url.searchParams.set("aff_sub1", keyword);
      url.searchParams.set("aff_sub2", matchtype);
      url.searchParams.set("aff_sub3", device);
      url.searchParams.set("extclid", gclid);

      // Atualiza o href do link com a nova URL
      link.href = url.toString();

      console.log(`Link atualizado: ${link.href}`);
    });
  }

  const platform = getPlatform();
  if (!platform) {
    console.warn(
      "Plataforma não identificada. Nenhuma alteração será feita nos links."
    );
  } else {
    console.log(`Plataforma identificada: ${platform}`);
    switch (platform) {
      case "clickbank":
        clickbankUpdateLinks();
        break;
      case "smartadv":
        smartAdvUpdateLinks();
        break;
      default:
        console.warn(
          `Nenhuma função de atualização definida para a plataforma: ${platform}`
        );
    }
  }
})();
// ==UserScript==
