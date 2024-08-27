// class Carousel extends HTMLElement {
//   constructor() {
//     super();

//     this.track = this.querySelector('.carousel-track');
//     this.slides = Array.from(this.track.children);
//     this.nextButton = this.querySelector('.carousel-next');
//     this.prevButton = this.querySelector('.carousel-prev');
//     this.thumbnails = this.querySelectorAll('.thumbnail');
//     this.thumbnailContainer = this.querySelector('.carousel-thumbnails');

//     this.slidesPerView = parseInt(this.getAttribute('data-slides-per-view')) || 1;
//     this.spaceBetween = parseInt(this.getAttribute('data-space-between')) || 15;
//     this.swipeThreshold = 4;

//     this.currentIndex = 0;
//     this.isDragging = false;
//     this.startX = 0;
//     this.currentTranslate = 0;
//     this.prevTranslate = 0;
//     this.animationID = 0;

//     this.attachEvents = this.attachEvents.bind(this);
//     this.updateSlideWidth = this.updateSlideWidth.bind(this);
//     this.touchStart = this.touchStart.bind(this);
//     this.touchEnd = this.touchEnd.bind(this);
//     this.touchMove = this.touchMove.bind(this);

//     this.isVertical = this.getAttribute('vertical') !== null;

//     this.track.style.gap = `${this.spaceBetween}px`;

//     this.attachEvents();
//   }

//   connectedCallback() {
//     this.updateSlideWidth();
//     this.updateActiveThumbnail();
//     if (this.isVertical) {
//       this.updateThumbnailHeight();
//     }
//   }

//   attachEvents() {
//     let resizeTimeout;

//     window.addEventListener('resize', () => {
//       clearTimeout(resizeTimeout);

//       resizeTimeout = setTimeout(() => {
//         this.updateSlideWidth();

//         if (this.isVertical) {
//           this.updateThumbnailHeight();
//         }
//       }, 200);
//     });

//     this.track.addEventListener('mousedown', this.touchStart);
//     this.track.addEventListener('touchstart', this.touchStart);

//     document.addEventListener('mouseup', this.touchEnd);
//     document.addEventListener('touchend', this.touchEnd);

//     document.addEventListener('mousemove', this.touchMove);
//     document.addEventListener('touchmove', this.touchMove);

//     this.nextButton.addEventListener('click', () => {
//       if (this.currentIndex < this.slides.length - this.slidesPerView) {
//         this.moveToSlide(this.currentIndex + this.slidesPerView);
//       }
//     });

//     this.prevButton.addEventListener('click', () => {
//       if (this.currentIndex > 0) {
//         this.moveToSlide(this.currentIndex - this.slidesPerView);
//       }
//     });

//     this.thumbnails.forEach((thumb, index) => {
//       thumb.addEventListener('click', () => this.moveToSlide(index));
//     });
//   }

//   updateSlideWidth() {
//     this.slideWidth = this.slides[0].getBoundingClientRect().width + this.spaceBetween;
//     this.setPositionByIndex();
//   }

//   updateThumbnailHeight() {
//     const trackHeight = this.track.getBoundingClientRect().height;
//     this.thumbnailContainer.style.maxHeight = `${trackHeight}px`;
//   }

//   moveToSlide(index) {
//     this.currentIndex = index;
//     this.setPositionByIndex();
//     this.updateActiveThumbnail();
//   }

//   updateActiveThumbnail() {
//     const activeThumbnail = this.thumbnails[this.currentIndex];

//     this.thumbnails.forEach((thumb, idx) => {
//       thumb.classList.toggle('active', idx === this.currentIndex);
//     });

//     const scrollOptions = {
//       behavior: 'smooth',
//     };

//     if (this.isVertical) {
//       scrollOptions.top = activeThumbnail.offsetTop;
//     } else {
//       scrollOptions.left = activeThumbnail.offsetLeft;
//     }

//     this.thumbnailContainer.scroll(scrollOptions);
//   }

//   setPositionByIndex() {
//     this.currentTranslate = this.currentIndex * -this.slideWidth;
//     this.prevTranslate = this.currentTranslate;
//     this.track.style.transform = `translateX(${this.currentTranslate}px)`;
//   }

//   touchStart(event) {
//     if (event.target.closest('.carousel-track')) {
//       this.startX = this.getPositionX(event);
//       this.isDragging = true;
//       this.animationID = requestAnimationFrame(this.animation.bind(this));
//       this.track.style.transition = 'none';
//     }
//   }

//   touchEnd() {
//     if (this.isDragging) {
//       this.isDragging = false;
//       cancelAnimationFrame(this.animationID);

//       const movedBy = this.currentTranslate - this.prevTranslate;
//       if (Math.abs(movedBy) > this.slideWidth / this.swipeThreshold) {
//         if (movedBy < 0 && this.currentIndex < this.slides.length - this.slidesPerView) {
//           this.currentIndex += this.slidesPerView;
//         } else if (movedBy > 0 && this.currentIndex > 0) {
//           this.currentIndex -= this.slidesPerView;
//         }
//       }

//       this.setPositionByIndex();
//       this.track.style.transition = 'transform 0.3s ease-out';
//       this.updateActiveThumbnail();
//     }
//   }

//   touchMove(event) {
//     if (this.isDragging) {
//       const currentPosition = this.getPositionX(event);
//       this.currentTranslate = this.prevTranslate + currentPosition - this.startX;
//     }
//   }

//   getPositionX(event) {
//     return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
//   }

//   animation() {
//     if (this.isDragging) {
//       this.track.style.transform = `translateX(${this.currentTranslate}px)`;
//       requestAnimationFrame(this.animation.bind(this));
//     }
//   }
// }

// customElements.define('carousel-container', Carousel);

class Carousel extends HTMLElement {
  constructor() {
    super();

    this.track = this.querySelector('.carousel-track');
    this.slides = Array.from(this.track.children);
    this.nextButton = this.querySelector('.carousel-next');
    this.prevButton = this.querySelector('.carousel-prev');
    this.thumbnails = this.querySelectorAll('.thumbnail');
    this.thumbnailContainer = this.querySelector('.carousel-thumbnails');

    this.slidesPerView = parseInt(this.getAttribute('data-slides-per-view')) || 1;
    this.spaceBetween = parseInt(this.getAttribute('data-space-between')) || 15;
    this.swipeThreshold = 4;

    this.currentIndex = 0;
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.animationID = 0;

    this.attachEvents = this.attachEvents.bind(this);
    this.updateSlideWidth = this.updateSlideWidth.bind(this);
    this.touchStart = this.touchStart.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.touchMove = this.touchMove.bind(this);

    this.isVertical = this.getAttribute('vertical') !== null;

    this.track.style.gap = `${this.spaceBetween}px`;

    this.attachEvents();
  }

  connectedCallback() {
    this.updateSlideWidth();
    this.updateActiveThumbnail();
    this.toggleButtons();
    if (this.isVertical) {
      this.updateThumbnailHeight();
    }
  }

  attachEvents() {
    let resizeTimeout;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        this.updateSlideWidth();

        if (this.isVertical) {
          this.updateThumbnailHeight();
        }
      }, 200);
    });

    this.track.addEventListener('mousedown', this.touchStart);
    this.track.addEventListener('touchstart', this.touchStart);

    document.addEventListener('mouseup', this.touchEnd);
    document.addEventListener('touchend', this.touchEnd);

    document.addEventListener('mousemove', this.touchMove);
    document.addEventListener('touchmove', this.touchMove);

    this.nextButton.addEventListener('click', () => {
      if (this.currentIndex < this.slides.length - this.slidesPerView) {
        this.moveToSlide(this.currentIndex + this.slidesPerView);
      }
    });

    this.prevButton.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.moveToSlide(this.currentIndex - this.slidesPerView);
      }
    });

    this.thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => this.moveToSlide(index));
    });
  }

  updateSlideWidth() {
    this.slideWidth = this.slides[0].getBoundingClientRect().width + this.spaceBetween;
    this.setPositionByIndex();
  }

  updateThumbnailHeight() {
    const trackHeight = this.track.getBoundingClientRect().height;
    this.thumbnailContainer.style.maxHeight = `${trackHeight}px`;
  }

  moveToSlide(index) {
    this.currentIndex = index;
    this.setPositionByIndex();
    this.updateActiveThumbnail();
    this.toggleButtons(); // Ensure buttons are toggled after each slide change
  }

  updateActiveThumbnail() {
    const activeThumbnail = this.thumbnails[this.currentIndex];

    this.thumbnails.forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === this.currentIndex);
    });

    const scrollOptions = {
      behavior: 'smooth',
    };

    if (this.isVertical) {
      scrollOptions.top = activeThumbnail.offsetTop;
    } else {
      scrollOptions.left = activeThumbnail.offsetLeft;
    }

    this.thumbnailContainer.scroll(scrollOptions);
  }

  toggleButtons() {
    // Hide prev button if at the first slide
    this.prevButton.style.display = this.currentIndex === 0 ? 'none' : '';

    // Hide next button if at the last slide
    const isLastSlide = this.currentIndex >= this.slides.length - this.slidesPerView;
    this.nextButton.style.display = isLastSlide ? 'none' : '';
  }

  setPositionByIndex() {
    this.currentTranslate = this.currentIndex * -this.slideWidth;
    this.prevTranslate = this.currentTranslate;
    this.track.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  touchStart(event) {
    if (event.target.closest('.carousel-track')) {
      this.startX = this.getPositionX(event);
      this.isDragging = true;
      this.animationID = requestAnimationFrame(this.animation.bind(this));
      this.track.style.transition = 'none';
    }
  }

  touchEnd() {
    if (this.isDragging) {
      this.isDragging = false;
      cancelAnimationFrame(this.animationID);

      const movedBy = this.currentTranslate - this.prevTranslate;
      if (Math.abs(movedBy) > this.slideWidth / this.swipeThreshold) {
        if (movedBy < 0 && this.currentIndex < this.slides.length - this.slidesPerView) {
          this.currentIndex += this.slidesPerView;
        } else if (movedBy > 0 && this.currentIndex > 0) {
          this.currentIndex -= this.slidesPerView;
        }
      }

      this.setPositionByIndex();
      this.track.style.transition = 'transform 0.3s ease-out';
      this.updateActiveThumbnail();
      this.toggleButtons(); // Re-check button visibility after swiping
    }
  }

  touchMove(event) {
    if (this.isDragging) {
      const currentPosition = this.getPositionX(event);
      this.currentTranslate = this.prevTranslate + currentPosition - this.startX;
    }
  }

  getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  animation() {
    if (this.isDragging) {
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;
      requestAnimationFrame(this.animation.bind(this));
    }
  }
}

customElements.define('carousel-container', Carousel);
