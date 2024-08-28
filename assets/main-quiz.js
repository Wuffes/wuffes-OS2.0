class Quiz extends HTMLElement {
  constructor() {
    super();

    this.fullPriceUrl = this.dataset.redirectUrl ?? false;
    this.jcPdpSbUrl = this.dataset.redirectUrlPdpSb ?? false;
    this.jcPdpLbUrl = this.dataset.redirectUrlPdpLb ?? false;
    this.fetchUrl = this.dataset.gcloudUrl ?? false;
    this.defaultRedirect = this.dataset.defaultRedirect ?? 'full_price';

    this.quizInputs = {};
    this.setUpEventListeners();
  }

  setUpEventListeners() {
    document.addEventListener('DOMContentLoaded', this.onInit.bind(this));

    if (Shopify.designMode) {
      document.addEventListener('shopify:section:load', this.onSectionLoad.bind(this));
    }

    this.querySelectorAll("input:not([type='submit'])").forEach((input) => {
      if (input.type === 'radio') {
        input.addEventListener('click', this.onTabChange.bind(this));
      } else {
        input.addEventListener('input', this.onInputChange.bind(this));

        if (input.type !== 'email') {
          input.addEventListener('keypress', this.onInputKeyPress.bind(this));
        }
      }
    });

    this.querySelectorAll("input[name='breed']").forEach((breedInput) => {
      breedInput.addEventListener('click', this.onBreedInputClick.bind(this));
      breedInput.addEventListener('blur', this.onBreedInputBlur.bind(this));
    });

    this.querySelectorAll('ul[data-breed-list] li').forEach((list) =>
      list.addEventListener('click', this.onBreedSelect.bind(this))
    );

    this.querySelectorAll('form').forEach((form) => {
      form.addEventListener('submit', this.onFormSubmit.bind(this));
    });

    this.querySelectorAll('quiz-back').forEach((backBtn) =>
      backBtn.addEventListener('click', this.onBackClick.bind(this))
    );
  }

  onInit() {
    const quizFirstStep = this.querySelector("quiz-step[quiz-step-index='0']");
    const quizTextInputs = this.querySelectorAll("input[type='text'], input[type='number'], input[type='email']");

    setTimeout(() => {
      quizTextInputs.forEach((input) => {
        const thisInputBtn = input.closest('quiz-step');

        this.toggleSubmitButton(thisInputBtn, input.value.trim() !== '');
      });
    }, 500);

    this.animateElementBlocks(quizFirstStep);
  }

  onSectionLoad() {
    this.querySelectorAll('quiz-step').forEach((step) => {
      step.style.display = 'block';

      step.querySelectorAll('[animate-fade-in]').forEach((element) => {
        element.removeAttribute('animate-fade-in');
      });
    });
  }

  onBreedInputClick(event) {
    const breedDropdown = event.target.parentElement.querySelector('ul[data-breed-list]');
    breedDropdown.style.display = 'block';
    clearTimeout(this.hideTimeout);
  }

  onBreedInputBlur(event) {
    const breedDropdown = event.target.parentElement.querySelector('ul[data-breed-list]');

    this.hideTimeout = setTimeout(() => {
      const selectedBreed = breedDropdown.querySelector('li[selected]');

      event.target.value =
        event.target.value === '' || selectedBreed === null ? 'Not sure / Not listed' : selectedBreed.textContent;

      breedDropdown.style.display = 'none';

      this.toggleSubmitButton(this.getCurrentStep(event), true);
    }, 200);
  }

  onBreedSelect(event) {
    const thisBreed = event.target.textContent;
    const thisInput = event.target.parentElement.previousElementSibling;
    const breedLists = event.target.parentElement.querySelectorAll('li');

    breedLists.forEach((list) => list.removeAttribute('selected'));
    event.target.setAttribute('selected', true);

    thisInput.value = thisBreed;
  }

  filterDropdown(event) {
    const dropDown = event.target.nextElementSibling;

    if (dropDown !== null && dropDown.hasAttribute('data-breed-list')) {
      const inputValue = event.target.value.toLowerCase();
      let firstItemFound = false;

      if (!dropDown.originalItems) {
        dropDown.originalItems = Array.from(dropDown.querySelectorAll('li'));
      }

      dropDown.innerHTML = '';

      dropDown.originalItems.forEach((li) => {
        const listItemText = li.textContent;
        const lowerCaseListItemText = listItemText.toLowerCase();

        if (lowerCaseListItemText.includes(inputValue)) {
          const boldedText = listItemText.replace(new RegExp(inputValue, 'gi'), (match) => `<strong>${match}</strong>`);
          li.innerHTML = boldedText;

          if (!firstItemFound) {
            li.setAttribute('selected', 'true');
            firstItemFound = true;
          } else {
            li.removeAttribute('selected');
          }

          dropDown.appendChild(li);
        }
      });
    }
  }

  getCurrentStep(event) {
    return event.target.closest('quiz-step');
  }

  onTabChange(event) {
    const currentStep = this.getCurrentStep(event);
    const submitButton = currentStep.querySelector("input[type='submit']");
    const labels = currentStep.querySelectorAll('label');

    if (submitButton === null) {
      labels.forEach((label) => label.toggleAttribute('disabled', true));

      setTimeout(() => {
        this.onFormSubmit(event);
        labels.forEach((label) => label.toggleAttribute('disabled', false));
      }, 600);
    } else {
      this.toggleSubmitButton(this.getCurrentStep(event), true);
    }
  }

  onInputChange(event) {
    const isEmpty = event.target.value.trim() === '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = event.target.type === 'email';
    const isValid = isEmail ? emailRegex.test(event.target.value) : !isEmpty;

    event.target.name === 'breed' ? this.filterDropdown(event) : null;

    this.toggleSubmitButton(this.getCurrentStep(event), isValid);
  }

  onInputKeyPress(event) {
    if (!/^[a-zA-Z0-9\s]+$/.test(String.fromCharCode(event.which))) {
      event.preventDefault();
    }
  }

  toggleSubmitButton(currentStep, enable) {
    const submitButton = currentStep.querySelector("input[type='submit']");

    submitButton !== null ? submitButton.toggleAttribute('disabled', !enable) : null;
  }

  onFormSubmit(event) {
    event.preventDefault();

    const form = event.target.closest('form');
    const formData = new FormData(form);
    const formDataJson = {};

    formData.forEach((value, key) => {
      formDataJson[key] = formDataJson[key] ? [].concat(formDataJson[key], value) : value;
    });

    if (Object.keys(formDataJson)[0] === 'name') {
      this.updateDogName(formDataJson.name);
    }

    Object.assign(this.quizInputs, formDataJson);
    this.navigateStep(this.getCurrentStep(event), 'next');
  }

  navigateStep(currentStep, direction) {
    const targetStep = direction === 'next' ? currentStep.nextElementSibling : currentStep.previousElementSibling;
    const targetIndex = targetStep.getAttribute('quiz-step-index');

    currentStep.style.display = 'none';
    targetStep.style.display = 'flex';

    this.animateProgressBar(targetIndex);
    this.animateElementBlocks(targetStep);

    targetIndex === 'last' && this.quizFinalStep(targetStep);
  }

  onBackClick(event) {
    this.navigateStep(this.getCurrentStep(event), 'prev');
  }

  updateDogName(dogName) {
    const dogNameElement = this.querySelectorAll('[dog-name]');
    const dogNameFormatted = dogName.replace(/^(\w)(.+)/, (match, p1, p2) => p1.toUpperCase() + p2.toLowerCase());

    dogNameElement.forEach((el) => (el.textContent = dogNameFormatted));
  }

  animateElementBlocks(targetStep) {
    const animatedBlocks = targetStep.querySelectorAll('[animate-fade-in]');
    const delay = 200;

    animatedBlocks.forEach((block, index) => {
      setTimeout(() => {
        block.removeAttribute('animate-fade-in');
      }, index * delay);
    });
  }

  animateProgressBar(targetIndex) {
    const progressBar = this.querySelector('quiz-progress');
    const progressBarInner = progressBar.querySelector('[quiz-progress-inner]');
    const progressBarText = progressBar.querySelector('[quiz-progress-text]');

    if (targetIndex !== 'last') {
      const quizCount = this.querySelectorAll('quiz-step').length - 2; //subtract email step and final step
      const currentProgress = Math.round((100 / quizCount) * Number(targetIndex)) + '%';

      progressBar.style.display = progressBar.style.display === 'none' ? 'block' : progressBar.style.display;
      window.requestAnimationFrame(function () {
        progressBarInner.style.width = currentProgress;
        progressBarText.textContent = currentProgress;
      });
    } else {
      progressBar.style.display = 'none';
    }
  }

  quizFinalStep(targetStep) {
    const loadingScreenProgress = targetStep.querySelector('[loading-screen-progress]');
    window.requestAnimationFrame(() => (loadingScreenProgress.style.width = '100%'));

    loadingScreenProgress.addEventListener('transitionend', () => {
      this.redirectPage();
    });
  }

  redirectPage() {
    const fetch_url = this.fetchUrl;
    const customerEmail = this.quizInputs.email;

    if (fetch_url) {
      // Using AbortController for timeout management
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: customerEmail }),
        signal: controller.signal,
      };

      fetch(fetch_url, options)
        .then((response) => {
          clearTimeout(timeoutId); // Clear the timeout once the response is received
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((hasPreviousPurchase) => {
          const sourceType = hasPreviousPurchase ? 'product_page' : 'full_price';
          return this.sendDataToKlaviyo(sourceType);
        })
        .then((redirectURL) => {
          location.href = redirectURL;
        })
        .catch((error) => {
          this.sendDataToKlaviyo(this.defaultRedirect).then((redirectURL) => {
            location.href = redirectURL;
          });
        });
    }
  }

  async sendDataToKlaviyo(sourceType) {
    let redirectURL = false;

    //Send Data To Klaviyo
    const KLdata = {
      type: 'profile',
      attributes: {
        email: this.quizInputs.email,
        properties: {},
      },
    };

    Object.keys(this.quizInputs).forEach((name) => {
      const fullName = `dog_${name}`;

      if (name !== 'email') {
        KLdata.attributes.properties[fullName] = this.quizInputs[name];
      }
    });

    KLdata.attributes.properties['$source'] = 'full prize quiz';

    redirectURL = this.buildRedirectUrl(sourceType);

    if (sourceType == 'full_price' && redirectURL != '') {
      KLdata.attributes.properties['abandoned_cart_redirect_url'] = redirectURL;
    }

    const KLoptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        revision: '2024-02-15',
      },
      body: JSON.stringify({ data: KLdata }),
    };

    await fetch('https://a.klaviyo.com/client/profiles/?company_id=SQEMbF', KLoptions).catch((err) =>
      console.error(err)
    );

    return redirectURL;
  }

  buildRedirectUrl(sourceType) {
    let redirectUrl = '';
    const userInputsJson = { ...this.quizInputs };
    const targetUrl = this.fullPriceUrl;

    const quizParams = Object.entries(userInputsJson)
      .filter(([key]) => key !== 'email')
      .map(([key, value], index) => {
        const separator = index === 0 && !targetUrl.includes('?') ? '?' : '&';

        value = key === 'weight' ? value.replace(/\s/g, '') : value.replace(/\s/g, '_');
        userInputsJson[key] = value;

        return `${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('');

    localStorage.setItem('quiz_data', JSON.stringify(userInputsJson));

    if (sourceType === 'full_price') {
      redirectUrl = targetUrl + quizParams;
    } else {
      const weight = this.quizInputs.weight;

      const dogSizeType =
        weight === '65-100 lbs' || weight === '100-120 lbs' || weight === 'Over 120 lbs' ? 'LB' : 'SB';

      redirectUrl = dogSizeType === 'SB' ? this.jcPdpSbUrl : this.jcPdpLbUrl;
    }

    return redirectUrl;
  }
}

customElements.define('main-quiz', Quiz);
