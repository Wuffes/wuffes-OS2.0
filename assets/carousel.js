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
    this.isVertical = this.hasAttribute('vertical');

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
    this.updateNavButtons = this.updateNavButtons.bind(this);

    this.initialize();
  }

  initialize() {
    this.track.style.gap = `${this.spaceBetween}px`;
    this.attachEvents();
  }

  connectedCallback() {
    this.updateSlideWidth();
    this.updateActiveThumbnail();
    this.updateNavButtons();

    if (this.isVertical && this.thumbnailContainer) {
      this.updateThumbnailHeight();
    }
  }

  attachEvents() {
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 200));

    ['mousedown', 'touchstart'].forEach((event) => this.track.addEventListener(event, this.touchStart));
    ['mouseup', 'touchend'].forEach((event) => document.addEventListener(event, this.touchEnd));
    ['mousemove', 'touchmove'].forEach((event) => document.addEventListener(event, this.touchMove));

    this.nextButton.addEventListener('click', () => this.moveToSlide(this.currentIndex + this.slidesPerView));
    this.prevButton.addEventListener('click', () => this.moveToSlide(this.currentIndex - this.slidesPerView));

    this.thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => this.moveToSlide(index));
    });

    if (this.thumbnailContainer) {
      this.attachThumbnailDragEvents();
    }
  }

  debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  handleResize() {
    this.updateSlideWidth();
    if (this.isVertical && this.thumbnailContainer) {
      this.updateThumbnailHeight();
    }
  }

  attachThumbnailDragEvents() {
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const startDrag = (x) => {
      isDragging = true;
      startX = x - this.thumbnailContainer.offsetLeft;
      scrollLeft = this.thumbnailContainer.scrollLeft;
      this.thumbnailContainer.classList.add('is-grabbing');
    };

    const stopDrag = () => {
      isDragging = false;
      this.thumbnailContainer.classList.remove('is-grabbing');
    };

    const dragMove = (x) => {
      if (!isDragging) return;
      const walk = (x - startX) * 1.5;
      this.thumbnailContainer.scrollLeft = scrollLeft - walk;
    };

    ['mousedown', 'touchstart'].forEach((event) => {
      this.thumbnailContainer.addEventListener(event, (e) => startDrag(e.pageX || e.touches[0].pageX));
    });

    ['mouseleave', 'mouseup', 'touchend'].forEach((event) => {
      this.thumbnailContainer.addEventListener(event, stopDrag);
    });

    ['mousemove', 'touchmove'].forEach((event) => {
      this.thumbnailContainer.addEventListener(event, (e) => {
        e.preventDefault();
        dragMove(e.pageX || e.touches[0].pageX);
      });
    });
  }

  updateSlideWidth() {
    const slideFixedWidths = `calc((100% / ${this.slidesPerView}) - ((${this.spaceBetween}px / ${this.slidesPerView}) * (${this.slidesPerView} - 1)))`;
    this.slides.forEach((slide) => {
      slide.style.minWidth = slideFixedWidths;
      slide.style.display = 'block';
    });

    const slideRect = this.slides[0].getBoundingClientRect();
    this.slideWidth = slideRect.width + this.spaceBetween;

    this.setPositionByIndex();
    this.updateNavButtons();
  }

  updateThumbnailHeight() {
    const trackHeight = this.track.getBoundingClientRect().height;
    this.thumbnailContainer.style.maxHeight = `${trackHeight}px`;
  }

  moveToSlide(index) {
    const maxIndex = Math.floor(this.slides.length / this.slidesPerView) * this.slidesPerView;
    const remainingSlides = this.slides.length % this.slidesPerView;

    this.currentIndex =
      index >= maxIndex && remainingSlides !== 0
        ? this.slides.length - this.slidesPerView
        : Math.max(0, Math.min(index, this.slides.length - this.slidesPerView));

    this.setPositionByIndex();
    this.updateActiveThumbnail();
    this.updateNavButtons();
  }

  updateActiveThumbnail() {
    if (this.thumbnails.length === 0) return;

    this.thumbnails.forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === this.currentIndex);
    });

    const activeThumbnail = this.thumbnails[this.currentIndex];
    const containerScrollPosition = this.isVertical
      ? activeThumbnail.offsetTop - this.thumbnailContainer.offsetTop
      : activeThumbnail.offsetLeft - this.thumbnailContainer.offsetLeft;

    const scrollOptions = {
      behavior: 'smooth',
      [this.isVertical ? 'top' : 'left']: containerScrollPosition,
    };

    this.thumbnailContainer.scrollTo(scrollOptions);
  }

  setPositionByIndex() {
    this.currentTranslate = this.currentIndex * -this.slideWidth;
    this.prevTranslate = this.currentTranslate;
    this.track.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  updateNavButtons() {
    const maxIndex = Math.floor(this.slides.length / this.slidesPerView) * this.slidesPerView;
    const remainingSlides = this.slides.length % this.slidesPerView;
    const lastValidIndex =
      remainingSlides === 0 ? maxIndex - this.slidesPerView : this.slides.length - this.slidesPerView;

    this.prevButton.style.display = this.currentIndex > 0 ? 'flex' : 'none';
    this.nextButton.style.display = this.currentIndex >= lastValidIndex ? 'none' : 'flex';
  }

  touchStart(event) {
    if (!event.target.closest('.carousel-track')) return;
    this.startX = this.getPositionX(event);
    this.isDragging = true;
    this.track.style.transition = 'none';
    this.animationID = requestAnimationFrame(this.animateSlide.bind(this));
  }

  touchEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    cancelAnimationFrame(this.animationID);

    const movedBy = this.currentTranslate - this.prevTranslate;

    if (Math.abs(movedBy) > this.slideWidth / this.swipeThreshold) {
      this.currentIndex =
        movedBy < 0
          ? Math.min(this.currentIndex + this.slidesPerView, this.slides.length - this.slidesPerView)
          : Math.max(this.currentIndex - this.slidesPerView, 0);
    }

    this.constrainIndexWithinBounds();
    this.setPositionByIndex();
    this.track.style.transition = 'transform 0.3s ease-out';
    this.updateActiveThumbnail();
    this.updateNavButtons();
  }

  constrainIndexWithinBounds() {
    const maxIndex = Math.floor(this.slides.length / this.slidesPerView) * this.slidesPerView;
    const remainingSlides = this.slides.length % this.slidesPerView;

    this.currentIndex = Math.max(
      0,
      Math.min(
        this.currentIndex,
        remainingSlides === 0 ? maxIndex - this.slidesPerView : this.slides.length - this.slidesPerView
      )
    );
  }

  touchMove(event) {
    if (!this.isDragging) return;
    const currentPosition = this.getPositionX(event);
    this.currentTranslate = this.prevTranslate + currentPosition - this.startX;
  }

  getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  animateSlide() {
    if (!this.isDragging) return;
    this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    requestAnimationFrame(this.animateSlide.bind(this));
  }
}

customElements.define('carousel-container', Carousel);
