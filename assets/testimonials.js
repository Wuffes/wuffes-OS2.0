document.addEventListener('DOMContentLoaded', () => {
  const blocks = document.querySelectorAll('.block_video_wrapper');

  blocks.forEach((block) => {
    const media = block.querySelector('.video-section__media');
    const slideCardBottom = block.querySelector('.js_slide_card_bottom');

    media.addEventListener('click', () => {
      slideCardBottom.classList.add('active-class');
    });
  });
});
