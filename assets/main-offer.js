class OfferPicker extends ModalDialog {
  constructor() {
    super();
  }
}

customElements.define('popup-picker', OfferPicker);

class offerModalOpener extends ModalOpener {
  constructor() {
    super();

    this.querySelector('button').addEventListener('click', this.onButtonClick.bind(this));
  }

  onButtonClick(event) {
    const allPopupPickerModal = document.querySelectorAll('popup-picker');
    const target = event.target.parentElement.getAttribute('data-modal');

    allPopupPickerModal.forEach((picker) => {
      if (target.replace('#', '') !== picker.getAttribute('id')) {
        picker.removeAttribute('open');
      }
    });
  }
}

customElements.define('popup-picker-opener', offerModalOpener);
