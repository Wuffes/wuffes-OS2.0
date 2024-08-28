class MainOffer extends HTMLElement {
  constructor() {
    super();

    document.addEventListener('DOMContentLoaded', this.onInit.bind(this));

    const quizEntries = this.getQuizEntries();
    this.dogWeight = quizEntries['weight'] ?? '0-35lbs';
    this.hasJointIssues = quizEntries['joint-issues'] ?? 'no';
    this.tubType = this.getTubSize(this.dogWeight);
  }

  onInit() {
    this.clearCart();

    this.setTimerBlock();
    this.showCarousels();
  }

  showCarousels() {
    const allCarousels = document.querySelectorAll('.offer-carousel__wrap');

    allCarousels.forEach((carousel) =>
      carousel.getAttribute('dogsize-type') === this.tubType ? carousel.setAttribute('shown', '') : carousel.remove()
    );
  }

  setTimerBlock() {
    const timerBeforeNoon = this.querySelector('[timer-before-noon]');
    const timerAfterNoon = this.querySelector('[timer-after-noon]');
    const timerEl = this.querySelector('timer');

    const now = new Date();

    if (now.getUTCHours() >= 12) {
      timerBeforeNoon.removeAttribute('is-shown');
      timerAfterNoon.setAttribute('is-shown', '');
    } else {
      timerAfterNoon.removeAttribute('is-shown');
      timerBeforeNoon.setAttribute('is-shown', '');
      startCountdown();
    }

    function startCountdown() {
      const now = new Date();
      const targetUTCDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0, 0));
      const timeDifference = targetUTCDate - now;

      if (timeDifference <= 0) {
        timerEl.textContent = '00 : 00 : 00';
        return;
      }

      const { hours, minutes, seconds } = getTimeComponents(timeDifference);
      timerEl.textContent = `${hours} : ${minutes} : ${seconds}`;

      requestAnimationFrame(startCountdown);
    }

    function getTimeComponents(timeDifference) {
      const hours = String(Math.floor((timeDifference / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      const minutes = String(Math.floor((timeDifference / (1000 * 60)) % 60)).padStart(2, '0');
      const seconds = String(Math.floor((timeDifference / 1000) % 60)).padStart(2, '0');

      return { hours, minutes, seconds };
    }
  }

  getQuizEntries() {
    const params = new URLSearchParams(window.location.search);
    let quizParams = Object.fromEntries([...params.entries()].filter(([key]) => key !== 'view'));

    if (Object.keys(quizParams).length === 0) {
      quizParams = JSON.parse(localStorage.getItem('quiz_data')) || {};
    }

    return quizParams;
  }

  getTubSize(weight) {
    const smallBreeds = ['0-35lbs', '36-65lbs'];
    const largeBreeds = ['65-100lbs', '100-120lbs', 'Over120lbs'];

    if (smallBreeds.includes(weight)) return 'SB';
    if (largeBreeds.includes(weight)) return 'LB';

    return 'SB';
  }

  clearCart() {
    fetch(`/cart/clear.js?t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to clear the cart');
      })
      .catch((error) => console.error('Error clearing the cart:', error));
  }
}

customElements.define('main-offer', MainOffer);

class OfferPicker extends ModalDialog {
  constructor() {
    super();

    this.main = document.querySelector('main-offer');
    this.setInputs();
    this.setEventListeners();

    if (this.dataset.offerType === 'sub') {
      this.main.hasJointIssues === 'yes' ? this.initIntervalChart() : this.setSupplyLastsText();
    }
  }

  setEventListeners() {
    this.querySelectorAll('[picker-form]').forEach((form) =>
      form.addEventListener('change', this.onFormChange.bind(this))
    );

    this.querySelectorAll('[checkout]').forEach((button) =>
      button.addEventListener('click', this.onCheckOut.bind(this))
    );
  }

  setSupplyLastsText() {
    const form = this.querySelector('[picker-form]');
    const selectedInput = form.querySelector('input:checked');
    const quantity = +selectedInput.value;
    const chewsPerTub = +selectedInput.dataset.chewsPerTub * quantity;
    const chewsPerDay = +selectedInput.dataset.chewsPerDay;

    const supplyEl = this.querySelectorAll('supply');

    supplyEl.forEach((el) => {
      el.textContent = Math.round(chewsPerTub / chewsPerDay);
    });
  }

  initIntervalChart() {
    const intervalChartTrigger = document.querySelector('[interval-info]');
    const intervalChartModal = document.querySelector(intervalChartTrigger.dataset.modal);
    const intervalChartBtn = intervalChartTrigger.querySelector('button');

    const intervalChartBulletLists = intervalChartModal.querySelectorAll(
      `.chart__bullet-wrap:not(.chart__bullet-wrap--${this.main.dogWeight})`
    );

    intervalChartBtn.setAttribute('rehab', true);

    intervalChartBulletLists.forEach((bulletList) => {
      bulletList.remove();
    });

    this.showIntervalChartLists();
  }

  showIntervalChartLists() {
    const form = this.querySelector('[picker-form]');
    const selectedInput = form.querySelector('input:checked');
    const selectedInputValue = selectedInput.value;

    const allBulletTexts = document.querySelectorAll('.chart__bullet-inner');
    const activeBulletText = document.querySelector(
      `.chart__bullet-inner--${this.main.dogWeight}--${selectedInputValue}`
    );

    let initialDate = new Date();

    activeBulletText.querySelectorAll('[interval-date]').forEach((el) => {
      const intervalShiftEL = el.nextElementSibling;
      const nextIntervalBlock = el.closest('.chart__bullet-block')?.nextElementSibling;
      let intervalShift = +intervalShiftEL.dataset.intervalShift;

      let shippingDateObj = {};
      let shippingDateFormatted = 'Today';

      if (nextIntervalBlock?.classList.contains('chart__bullet-block')) {
        let nextIntervalShiftEL = nextIntervalBlock.querySelector('[interval-date]');

        shippingDateObj = this.getNextShippingDate(initialDate, intervalShift);
        shippingDateFormatted = shippingDateObj.nextShippingDateFormatted;
        initialDate = shippingDateObj.nextShippingDate;

        nextIntervalShiftEL.innerHTML = `<strong>Ships: ${shippingDateFormatted}</strong>`;
      }
    });

    allBulletTexts.forEach((list) => {
      list.removeAttribute('active');
    });

    activeBulletText.setAttribute('active', '');
  }

  onFormChange() {
    if (this.dataset.offerType === 'sub') {
      this.main.hasJointIssues === 'yes' ? this.showIntervalChartLists() : this.setSupplyLastsText();
    }
  }

  getNextShippingDate(initialDate, interval) {
    const nextShippingDate = new Date(initialDate);
    nextShippingDate.setDate(nextShippingDate.getDate() + interval);

    const month = nextShippingDate.getMonth() + 1;
    const day = nextShippingDate.getDate();

    return {
      nextShippingDate,
      nextShippingDateFormatted: `${month}/${day}`,
    };
  }

  onCheckOut(event) {
    event.preventDefault();

    const productData = this.getProductData(event);
    const buttonText = event.target.querySelector('strong');
    const spinner = event.target.querySelector('.loading__spinner');

    spinner.classList.remove('hidden');
    buttonText.classList.add('hidden');

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })
      .then((response) => response.json())
      .then(() => (window.location.href = '/checkout'))
      .catch((error) => console.error('Error:', error));
  }

  getProductData(event) {
    const form = event.target.closest('[picker-form]');
    const selectedInput = form.querySelector('input:checked');
    const purchaseType = selectedInput.dataset.purchaseType;
    const sellingPlan = selectedInput.dataset.sellingPlan;
    const quantity = parseInt(selectedInput.value);
    const variantID =
      purchaseType === 'sub'
        ? this.main.hasJointIssues === 'yes'
          ? selectedInput.dataset.variantIdRehab
          : selectedInput.dataset.variantIdPrev
        : selectedInput.dataset.variantIdOnetime;

    const mysteryGiftID = selectedInput.dataset.mysteryGift;
    const productData = {
      items: [
        {
          quantity,
          id: variantID,
          ...(purchaseType === 'sub' && { selling_plan: sellingPlan }),
        },
        ...(mysteryGiftID ? [{ quantity: 1, id: mysteryGiftID }] : []),
      ],
    };

    const properties = this.getProductDataProperties(selectedInput);

    productData.items.forEach((item) => (item.properties = properties));

    return productData;
  }

  getProductDataProperties(input) {
    const productType = this.main.dataset.productType;
    const purchaseType = input.dataset.purchaseType;
    const interval = input.dataset.interval.replace(/ /g, '-').toLowerCase();
    const dogSize = this.main.dogWeight;
    const dogSizeKey = `${productType}-${dogSize}`;
    const dogSizeValue = `${interval}-${purchaseType === 'sub' ? 'sub' : 'nosub'}`;
    const offerVersion = this.main.dataset.version.replace(/\s+/g, '');
    const discountTagKey = `FP${offerVersion}Discount`;
    const discountTagValue = input.dataset.discount;
    const giftTagValue = this.main.dataset.giftTag;
    const quizEntries = this.main.getQuizEntries();

    const properties = {
      _klaviyo_custom_tag: {
        ...Object.fromEntries(Object.entries(quizEntries).map(([key, value]) => [`dog1_${key}`, value])),
        [dogSizeKey]: dogSizeValue,
        'Full-Price-Offer': offerVersion,
        [discountTagKey]: discountTagValue,
        GIFT: giftTagValue,
      },
    };

    return properties;
  }

  setInputs() {
    const allPickerInputs = this.querySelectorAll('[data-dogsize]');
    const selectedPickerInput =
      this.querySelector(`[data-dogsize="${this.main.dogWeight}"]`) || this.querySelector('[data-dogsize="0-35lbs"]');
    const activeInput = selectedPickerInput.querySelector('input:not([disabled])');

    activeInput ? (activeInput.checked = true) : null;

    allPickerInputs.forEach((input) => {
      if (input !== selectedPickerInput) input.remove();
    });

    this.dataset.offerType === 'sub' ? this.displayLeastValuePrice() : null;
  }

  displayLeastValuePrice() {
    const newPriceEl = document.querySelector('[least-price-new]');
    const oldPriceEl = document.querySelector('[least-price-old]');
    const displayNewPriceEl = document.querySelector('new-price');
    const displayOldPriceEl = document.querySelector('old-price');

    if (newPriceEl && oldPriceEl && displayNewPriceEl && displayOldPriceEl) {
      const formatPrice = (el) => el.textContent.trim().split('.')[0];

      displayNewPriceEl.textContent = formatPrice(newPriceEl);
      displayOldPriceEl.textContent = formatPrice(oldPriceEl);
    }
  }
}

customElements.define('popup-picker', OfferPicker);

class OfferModalOpener extends ModalOpener {
  constructor() {
    super();

    this.querySelector('button').addEventListener('click', this.onButtonClick.bind(this));
  }

  onButtonClick(event) {
    event.preventDefault();

    const allPopupPickerModal = Array.from(document.querySelectorAll('popup-picker'));
    const targetID = event.target.parentElement.getAttribute('data-modal');
    const nonMatchingModals = allPopupPickerModal.filter((modal) => `#${modal.id}` !== targetID);

    nonMatchingModals.forEach((modal) => modal.removeAttribute('open'));
  }
}

customElements.define('popup-picker-opener', OfferModalOpener);
