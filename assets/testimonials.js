document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.testimonials_slider_block-video-wrapper');

  sections.forEach((section) => {
    const blocks = section.querySelectorAll('.block_video_wrapper');

    blocks.forEach((block) => {
      block.addEventListener('click', (event) => {
        const media = event.target.closest('.video-section__media');
        const slideCardBottom = block.querySelector('.js_slide_card_bottom');

        if (media && slideCardBottom) {
          slideCardBottom.classList.add('active-class');
        }
      });
    });

    const newNextButton = section.querySelector('.next-button.data-slider-button');
    const newPrevButton = section.querySelector('.prev-button.data-slider-button');

    const oldNextButton = section.querySelector('.slider-button--next');
    const oldPrevButton = section.querySelector('.slider-button--prev');

    newNextButton?.addEventListener('click', function () {
      oldNextButton?.click();
    });

    newPrevButton?.addEventListener('click', function () {
      oldPrevButton?.click();
    });
  });
});
