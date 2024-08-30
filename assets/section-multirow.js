document.addEventListener('DOMContentLoaded', function () {
  function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const queryParams = {};
    params.forEach((value, key) => {
      queryParams[key] = value;
    });
    return queryParams;
  }

  function replacePlaceholders(text, queryParams) {
    return text.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
      return queryParams[p1] !== undefined ? queryParams[p1] : match;
    });
  }

  const queryParams = getQueryParams();

  const elements = document.querySelectorAll('.url_attributes');

  elements.forEach((element) => {
    element.innerHTML = replacePlaceholders(element.innerHTML, queryParams);
  });
});
