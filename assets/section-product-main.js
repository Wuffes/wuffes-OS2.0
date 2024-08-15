// Synchronize active offers inputs
const radioGroups = document.querySelectorAll('.picker-dogsize_offers-group');

radioGroups.forEach(group => {
  group.addEventListener('change', event => {
    if (event.target.tagName === 'INPUT' && event.target.type === 'radio') {
      const selectedIndex = [...group.querySelectorAll('input[type="radio"]')].indexOf(event.target);

      radioGroups.forEach(otherGroup => {
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
  offerGroups.forEach(group => group.style.display = 'none');

  const activeInput = document.querySelector('.picker-dogsize_input:checked');

  if (activeInput) {
    const activeGroupId = activeInput.getAttribute('data-offers-group');
    const activeGroup = document.getElementById(activeGroupId);
    if (activeGroup) {
      activeGroup.style.display = 'block';
    }
  }
}

const dogSizeInputs = document.querySelectorAll('.picker-dogsize_input');
dogSizeInputs.forEach(input => {
  input.addEventListener('change', updateOfferGroups);
});

document.addEventListener('DOMContentLoaded', updateOfferGroups);
