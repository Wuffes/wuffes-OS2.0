// Synchronize active offers inputs
const offersGroups = document.querySelectorAll('.picker-dogsize_offers-group');

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

const dogSizeInputs = document.querySelectorAll('.picker-dogsize_input');
const purchaseTypeInput = document.getElementById('js__picker-purchase_type');
dogSizeInputs.forEach(input => {
  input.addEventListener('change', updateOfferGroups);
});

purchaseTypeInput.addEventListener('change', updateOfferGroups);

document.addEventListener('DOMContentLoaded', updateOfferGroups);

