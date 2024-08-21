class MainOffer extends HTMLElement {
  constructor() {
    super();

    const quizEntries = this.getQuizEntries();

    this.clearCart();
    this.dogWeight = quizEntries['weight'] ?? '0-35lbs';
    this.hasJointIssues = quizEntries['joint-issues'] ?? 'no';
    this.tubType = this.getTubSize(this.dogWeight);
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
  }

  setEventListeners() {
    this.querySelectorAll('form').forEach((form) => form.addEventListener('change', this.onFormChange.bind(this)));

    this.querySelectorAll('[checkout]').forEach((button) =>
      button.addEventListener('click', this.onCheckOut.bind(this))
    );
  }

  onFormChange() {
    console.log('form change');
  }

  onCheckOut(event) {
    event.preventDefault();

    const productData = this.getProductData(event);

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
    const form = event.target.closest('form');
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

    if (selectedPickerInput) {
      selectedPickerInput.style.display = 'flex';
      selectedPickerInput.querySelector('input').checked = true;
    }

    allPickerInputs.forEach((input) => {
      if (input !== selectedPickerInput) input.remove();
    });
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
