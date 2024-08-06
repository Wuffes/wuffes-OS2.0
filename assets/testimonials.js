document.addEventListener('DOMContentLoaded', () => {
  const blocks = document.querySelectorAll('.block_video_wrapper');

  blocks.forEach((block) => {
    block.addEventListener('click', (event) => {
      const media = event.target.closest('.video-section__media');
      const slideCardBottom = block.querySelector('.js_slide_card_bottom');

      if (media && slideCardBottom) {
        slideCardBottom.classList.add('active-class');
      }
    });
  });

  const newNextButton = document.querySelector('.next-button.data-slider-button');
  const newPrevButton = document.querySelector('.prev-button.data-slider-button');

  const oldNextButton = document.querySelector('.slider-button--next');
  const oldPrevButton = document.querySelector('.slider-button--prev');

  newNextButton.addEventListener('click', function () {
    oldNextButton.click();
  });

  newPrevButton.addEventListener('click', function () {
    oldPrevButton.click();
  });
});
