document.addEventListener('DOMContentLoaded', function () {
  function getUrlParameters(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.getAll(name);
  }

  const lineItems = getUrlParameters('line_items');

  if (lineItems.length > 0) {
    const sliderItems = document.querySelectorAll('.how-to-use_product-collection [data-sku]');

    sliderItems.forEach((item) => {
      const sku = item.getAttribute('data-sku');

      if (lineItems.includes(sku)) {
        item.remove();
      }
    });
  }
});
