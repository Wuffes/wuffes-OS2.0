document.addEventListener('DOMContentLoaded', function () {
  const dynamicSelectTitle = document.querySelector('.dynamic-select-title');
  const ul = document.querySelector('.dynamic-select ul');
  const selectTitleWrapper = document.querySelector('.select-title_wrapper');
  const productInformationSelects = document.querySelectorAll('.js-product-information-select');

  selectTitleWrapper.addEventListener('click', function () {
    ul.classList.toggle('open');
    dynamicSelectTitle.classList.toggle('active');
  });

  productInformationSelects.forEach(function (element, index) {
    const title = element.querySelector('.how-to-use__main-section--content_title').textContent.trim();
    const sku = element.getAttribute('data-sku');

    const li = document.createElement('li');
    li.textContent = title;
    li.dataset.sku = sku;
    ul.appendChild(li);

    li.addEventListener('click', function () {
      productInformationSelects.forEach(function (el) {
        el.classList.remove('active');
      });

      document.querySelector(`.js-product-information-select[data-sku="${sku}"]`).classList.add('active');
      dynamicSelectTitle.textContent = title;
      ul.classList.remove('open');
      dynamicSelectTitle.classList.remove('active');

      document.querySelectorAll('.js-questions-list__description').forEach(function (description) {
        if (description.parentElement.classList.contains('active')) {
          description.classList.add('open');
          description.style.maxHeight = description.scrollHeight + 5 + 'px';
        } else {
          description.classList.remove('open');
          description.style.maxHeight = '0px';
        }
      });
    });

    if (index === 0) {
      dynamicSelectTitle.textContent = title;
      element.classList.add('active');

      const firstDescription = document.querySelector('.js-questions-list__description');
      firstDescription.classList.add('open');
      firstDescription.style.maxHeight = firstDescription.scrollHeight + 5 + 'px';
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  function getUrlParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);

    const lineItems = urlParams.getAll('line_items');
    params['line_items'] = lineItems;
    params['dog_name'] = urlParams.get('dog_name');
    params['dd'] = urlParams.get('dd');

    return params;
  }

  const params = getUrlParams();

  params.line_items.forEach(function (value) {
    const element = document.querySelector(`.js-product-information[data-sku="${value}"]`);
    if (element) {
      element.classList.add('active');
    }
  });

  if (params.dog_name) {
    const petNameElements = document.querySelectorAll('.js__petname');
    petNameElements.forEach(function (element) {
      element.textContent = `${params.dog_name}’s`;
    });
  }

  if (params.dd !== null && params.dd === 'yes') {
    const directionsBlock = document.querySelector('.questions_list_double_dose_JC').parentElement;

    document.querySelector('.questions_list_double_dose_JC').style.display = 'block';

    directionsBlock
      .querySelectorAll('.questions-list__description:not(.questions-list__description--dd)')
      .forEach(function (element) {
        element.style.display = 'none';
      });

    directionsBlock
      .querySelectorAll('.how-to-use__main-section--img-item:not(.how-to-use__main-section--img-item-dd)')
      .forEach(function (element) {
        element.style.display = 'none';
      });
  }
});
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

document.addEventListener('DOMContentLoaded', function () {
  const firstDescription = document.querySelector('.js-questions-list__description');

  if (firstDescription) {
    const firstTitle = firstDescription.previousElementSibling;

    if (firstTitle && firstTitle.classList.contains('js-questions-list__title')) {
      firstDescription.classList.add('open');
      firstDescription.style.maxHeight = firstDescription.scrollHeight + 'px';
      firstTitle.classList.add('opened');
    }
  }

  const titles = document.querySelectorAll('.js-questions-list__title');

  if (titles.length > 0) {
    titles.forEach(function (title) {
      title.addEventListener('click', function () {
        const description = title.nextElementSibling;
        const isOpen = description.classList.contains('open');

        document.querySelectorAll('.js-questions-list__description').forEach(function (desc) {
          desc.classList.remove('open');
          desc.style.maxHeight = '0';
        });

        titles.forEach(function (t) {
          t.classList.remove('opened');
        });

        if (!isOpen) {
          description.classList.add('open');
          description.style.maxHeight = description.scrollHeight + 'px';
          title.classList.add('opened');
        }
      });
    });

    window.addEventListener(
      'resize',
      debounce(function () {
        const openedTab = document.querySelector('.js-questions-list__description.open');
        if (openedTab) {
          openedTab.style.maxHeight = openedTab.scrollHeight + 'px';
        }
      }, 200)
    );
  }
});
