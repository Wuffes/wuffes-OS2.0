const offersGroups = document.querySelectorAll('.picker-dogsize_offers-group');
const offersItems = document.querySelectorAll('.picker-offer_input');
const dogSizeInputs = document.querySelectorAll('.picker-dogsize_input');
const purchaseTypeInput = document.getElementById('js__picker-purchase_type');
const dogSizesTrigger = document.getElementById('dogsizes-selector-trigger');
const dogsizesTarget = document.getElementById('dogsizes-selector-target');

// Update CTA button
function updateCTA() {
  let activeOffersGroup = null;
  offersGroups.forEach((element) => {
    if (window.getComputedStyle(element).display === 'block') {
      activeOffersGroup = element;
      activeOffer = activeOffersGroup.querySelector('.picker-offer_input:checked');
      activeOfferPrice = activeOffer.getAttribute('data-discounted-price');

      document.getElementById('picker-submit_btn-price_discounted').textContent = activeOfferPrice
    }
  });
}

// Synchronize active offers inputs
offersGroups.forEach(group => {
  group.addEventListener('change', event => {
    if (event.target.tagName === 'INPUT' && event.target.type === 'radio') {
      const selectedIndex = [...group.querySelectorAll('input[type="radio"]')].indexOf(event.target);

      offersGroups.forEach(otherGroup => {
        if (otherGroup !== group) {
          const correspondingRadio = otherGroup.querySelectorAll('input[type="radio"]')[selectedIndex];
          correspondingRadio.checked = true;
        }
      });
    }
  });
});

// Switch between offer groups
function updateOfferGroups() {
  const offerGroups = document.querySelectorAll('.picker-dogsize_offers-group');

  let purchaseType = 'sub';

  if (purchaseTypeInput.checked) {
    purchaseType = 'sub';
  } else {
    purchaseType = 'otp';
  }

  offerGroups.forEach(group => group.style.display = 'none');

  const activeInput = document.querySelector('.picker-dogsize_input:checked');

  if (activeInput) {
    const activeGroupId = activeInput.getAttribute('data-offers-group') + '-' + purchaseType;
    const activeGroup = document.getElementById(activeGroupId);
    if (activeGroup) {
      activeGroup.style.display = 'block';
    }
  }
}

function updateDogsizeSelector(dogsize) {
  let dogsizeText = dogsize.getAttribute('data-dogsize-title');

  dogSizesTrigger.textContent = dogsizeText;
  dogsizesTarget.classList.add('dogsizes-hidden');

}

// Update visuals
dogSizeInputs.forEach(input => {
  input.addEventListener('change', function() {
    updateOfferGroups();
    updateCTA();
    updateDogsizeSelector(input);
  });
});

offersItems.forEach(offer => {
  offer.addEventListener('change', function() {
    updateCTA();
  });
});

purchaseTypeInput.addEventListener('change', function() {
  updateOfferGroups();
  updateCTA();
});

document.addEventListener('DOMContentLoaded', function() {
  updateOfferGroups();
  updateCTA();
});

dogSizesTrigger.addEventListener('click', function() {
  if (dogsizesTarget.classList.contains('dogsizes-hidden')) {
    dogsizesTarget.classList.remove('dogsizes-hidden');
  } else {
    dogsizesTarget.classList.add('dogsizes-hidden');
  }
});
