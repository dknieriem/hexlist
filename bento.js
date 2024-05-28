((Drupal) => {
  "use strict";

  
  class P19Carousel {
    static singleCardBreakpoint = 768;
    static carouselBreakpoint = 992;
    static slideSelector = ".card-tile__bento";
    static tallCardSelector = ".p19-medium-slide:nth-child(2n+1) .card-tile:nth-child(1), .p19-medium-slide:nth-child(2n) .card-tile:nth-child(2)";
    static shortCardSelector=".p19-medium-slide:nth-child(2n+1) .card-tile:nth-child(2), .p19-medium-slide:nth-child(2n) .card-tile:nth-child(1)";
    constructor(row) {
      this.wrapper = row.querySelector(".js-p19-carousel");
      this.slides = row.querySelectorAll(P19Carousel.slideSelector);  
      this.tallCards = row.querySelectorAll(P19Carousel.tallCardSelector);
      this.shortCards = row.querySelectorAll(P19Carousel.shortCardSelector);
      this.slideCount = this.slides.length;
      this.slideWidth = this.slideCount && this.slides[0].offsetWidth;
      this.sliderActive = false;
      this.sliderInitialized = false;
      this.currentSlide = 0;
      if (this.slideCount) {
        if (window.innerWidth < P19Carousel.carouselBreakpoint) {
          this.initSlider();
          this.sliderActive = true;
        }
        else {
          if (this.slideCount == 4 || this.slideCount ==6 ) {
            this.setCardHeights();
            this.sliderActive=false;
          }
        }
        window.addEventListener("resize", Drupal.debounce(this.handleResize, 200));
      }
    }
  
    handleResize =() => {
      this.slideWidth = this.slideCount && this.slides[0].offsetWidth;
      if (window.innerWidth < P19Carousel.carouselBreakpoint && !this.sliderActive) {
        this.clearCardHeights();
        this.sliderActive=true;
      }
      else {
        if ((this.slideCount == 4 || this.slideCount == 6)
            && window.innerWidth >= P19Carousel.carouselBreakpoint
            && this.sliderActive) {
          this.clearCardHeights();
          this.setCardHeights();
          this.sliderActive=false;
        }
      }
      if (window.innerWidth < P19Carousel.carouselBreakpoint && !this.sliderInitialized) {
        this.initSlider();
      }
      else {
        if (window.innerWidth >= P19Carousel.carouselBreakpoint && this.sliderInitialized) {
          this.slides.forEach((slide) => {
            slide.classList.remove("opacity-50");
            slide.classList.remove("opacity-25");
          });
          this.sliderActive=false;
        }
      }
    };
    
    setCardHeights = () => {
      let maxHeight=0;
      this.tallCards.forEach((slide) => {
        maxHeight = slide.offsetHeight > maxHeight ? slide.offsetHeight : maxHeight;
      });
      this.tallCards.forEach((slide) => {
        if (slide.offsetHeight < maxHeight) {
          slide.style.height=`${maxHeight}px`;
        }
      });
      maxHeight = 0;
      this.shortCards.forEach((slide) => {
        maxHeight = slide.offsetHeight > maxHeight ? slide.offsetHeight : maxHeight;
      });
      this.shortCards.forEach((slide) => {
        if (slide.offsetHeight < maxHeight) {
          slide.style.minHeight=`${maxHeight}px`;
        }
      });
    };

    clearCardHeights = () => {
      this.slides.forEach((slide) => {
        slide.style.height="";
        slide.style.minHeight="";
      });
    };

    initSlider = ()=> {
      const dots = this.wrapper.parentElement.parentElement.querySelectorAll(".p19-carousel__dots div");
      dots.forEach((dot, index) => {
        if (index !==0 ) {
          dot.classList.add("opacity-25");
        }
        dot.addEventListener("click", (() => {
          this.handleSliderPaginationClick(index);
        }).bind(this, index));
      });
      this.sliderPagination = dots;
      this.wrapper.addEventListener("scroll", this.handleSliderScroll.bind(this));
      this.sliderInitialized=true;
      this.sliderActive=true;
    };

    handleSliderScroll = Drupal.debounce(() => {
      const scrollLeft = this.wrapper.scrollLeft;
      const index = Math.round(scrollLeft / this.slideWidth);
      this.updateCurrentSlide(index);
    }, 200);

    handleMediumSliderScroll = Drupal.debounce(() => {
      const scrollLeft = this.wrapper.parentElement.scrollLeft;
      const index = Math.round(scrollLeft / this.mediumSlideWidth);
      this.updateMediumCurrentSlide(index);
    }, 200);

    handleSliderPaginationClick = (index) => {
      this.updateCurrentSlide(index);
      this.wrapper.scroll({left: index * this.slideWidth, behavior:"smooth"});
    };

    updateCurrentSlide = (index) => {
      this.sliderPagination[this.currentSlide].classList.add("opacity-25");
      this.sliderPagination[index].classList.remove("opacity-25");
      this.slides[this.currentSlide].classList.add("opacity-50");
      this.slides[index].classList.remove("opacity-50");
      this.currentSlide = index;

      if (window.innerWidth >= P19Carousel.singleCardBreakpoint && index + 1 < this.slideCount) {
        this.slides[index + 1].classList.remove("opacity-50");
        if (index + 2 < this.slideCount) {
          this.slides[index + 2].classList.add("opacity-50");
        }
      }
    };
  }

  const rows=document.querySelectorAll("#main-content .p19-reference--cards");
  rows.forEach((row) => {
    new P19Carousel(row);
  });
})(Drupal);