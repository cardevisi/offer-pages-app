(function () {
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

  // Função para atualizar todos os links na página
  function updateLinks() {
    // Captura todos os links da página que possuam o parâmetro 'tid'
    const links = document.querySelectorAll('a[href*="tid="], a[href]');

    // Loop através de cada link
    links.forEach((link) => {
      const url = new URL(link.href);

      // Substitui o valor do parâmetro 'tid'
      url.searchParams.set("tid", "gads_canada");
      url.searchParams.set("aff_sub1", keyword);
      url.searchParams.set("aff_sub2", matchtype);
      url.searchParams.set("aff_sub3", device);
      url.searchParams.set("extclid", gclid);

      // Atualiza o href do link com a nova URL
      link.href = url.toString();

      console.log(`Link atualizado: ${link.href}`);
    });
  }

  // Executa a função para atualizar os links
  updateLinks();
})();
// ==UserScript==
