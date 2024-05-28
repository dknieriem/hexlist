((Drupal) => {
  class HexList {
    static breakpointMobile=576;
    static breakpoint=768;
    static scrollWidth=1124;
    static cardWidth=500;
    static hexWidth=144;
    static gestureThreshhold=100;
    static cardBodyClass="r15-modal-noscroll";
    toggleFilter(event) {
      const target=event.target;
      this.filterOpen=!this.filterOpen;
      if(this.filterOpen){
        let titleEl=this.filterDropdown.closest(".r15__title");
        let dropdownTop=titleEl.offsetHeight+23;
        this.filterDropdown.style.top=`${dropdownTop}px`;
        this.filterDropdown.classList.add("active");
        this.filterEl.classList.add("active");
        this.closeHex(new Event("closeHexEvent"));
      }
      else {
        this.filterDropdown.classList.remove("active");
        this.filterEl.classList.remove("active");
      }
    }
    
    closeFilter(event){
      const target=this;
      this.filterOpen=false;
      this.filterDropdown.style.top="";
      this.filterDropdown.classList.remove("active");
      this.filterEl.classList.remove("active");
    }
    
    setFilter(event){
      this.closeFilter(new Event("closeFilterEvent"));
      const target=event.target;
      if (target.classList.contains("grid-dropdown__category") && target.hasAttribute("data-key")) {
        let key=target.getAttribute("data-key") || "-1";
        this.filterKey=parseInt(key);
        this.filterText.innerText=target.innerHTML+".";
        this.hexes.forEach((hex) => {
          if (this.filterKey===-1) {
            this.resetHex(hex);
          }
          else if (hex.hasAttribute("data-category")) {
            let categoriesString=hex.getAttribute("data-category") || "";
            let categories=categoriesString?.split(",") || [];
            if (categories.includes(key)) {
              this.enableHex(hex);
            }
            else {
              this.disableHex(hex);
            }
          }
          else {
            if (this.filterKey!=-1) {
              this.disableHex(hex);
            }
          }
        });
        
        this.filterOptions.forEach((option) => {
          if (key===option.getAttribute("data-key")) {
            option.classList.add("active");
          }
          else {
            option.classList.remove("active");
          }
        });
      }
    }
    
    resetHex(hex) {
      hex.classList.remove("enabled");
      hex.classList.remove("disabled");
    }
    
    disableHex(hex) {
      hex.classList.remove("enabled");
      hex.classList.add("disabled");
    }
    
    enableHex(hex){
      hex.classList.add("enabled");
      hex.classList.remove("disabled");
    }
    
    openHex(event){
      const target=event.target;
      this.hexes.forEach((hex) => {
        if (this.currentHoverTarget!==hex && hex.classList.contains("active")) {
          hex.classList.remove("active");
        }
      });
      
      this.card.classList.remove("active");
      let hex;
      if (target.classList.contains("hex")) {
        hex=target;
      }
      else {
        hex=target.closest(".hex");
      }
      
      if (hex===null || hex.classList.contains("disabled")) {
        return;
      }
      
      hex.classList.add("active");
      document.body.classList.add(HexList.cardBodyClass);
      this.replaceMedia(hex);
      this.setCardContent(hex);
      window.setTimeout(() => {
        this.card.classList.add("active");
      },75);
      this.resetTouch();
    }
    
    setCardContent(hex) {
      let description = this.card.querySelector(".r15--card__description");
      let cta = this.card.querySelector("a.btn-hover");
      description.innerHTML = hex.getAttribute("data-description");
      cta.setAttribute("href",hex.getAttribute("data-cta"));
      cta.innerHTML = hex.getAttribute("data-title");
      
      if (hex.getAttribute("data-hex")) {
        this.card.setAttribute("data-card", hex.getAttribute("data-hex"));
      }
    }
    closeHex(event) {
      const target = event.target;
      const viewportWidth = window.visualViewport.width;
      
      if (!target || target.closest("button.js-card-close") || !target.closest(".hex") && !target.closest(".r15--card")) {
        this.hexes.forEach((hex) => {
          if (hex.classList.contains("active")) {
            hex.classList.remove("active");
            let path = hex.querySelector("svg.svg__hover path");
          }
        });
        
        if (this.cardWistiaVideoPlayer) {
          this.cardWistiaVideoPlayer.pause();
        }
        this.card.classList.remove("active");
        this.videoContainer.classList.add("hidden");
        this.imageContainer.classList.add("hidden");
        
        while (this.imageContainer.firstChild) {
          this.imageContainer.removeChild(this.imageContainer.firstChild);
        }

        document.body.classList.remove(HexList.cardBodyClass);

        if (viewportWidth>HexList.breakpoint) {
          this.card.style.bottom  = "";
          this.card.style.left = "";
        }
      }
    }
    
    centerScroll() {
      const viewportWidth = window.visualViewport.width;
      if(viewportWidth > HexList.breakpoint && viewportWidth < HexList.scrollWidth) {
        let scrollPos = (HexList.scrollWidth-viewportWidth) / 2;
        this.scrollWrapper.scrollLeft = scrollPos;
        this.scrollLeft  =this.scrollWrapper.scrollLeft;
      }
    }
    
    resizeContainer() {
      let wrapperRect = this.wrapperEl.getBoundingClientRect();
      this.wrapperHeight = wrapperRect.height;
      this.wrapperWidth = wrapperRect.width;
      let scrollbarWrapper = this.wrapperEl.querySelector(".scrollbar-container");
      this.scrollbarWrapperWidth = scrollbarWrapper.getBoundingClientRect().width;
      let scrollableSection = this.wrapperEl.querySelector(".r15--row");
      this.scrollableWidth = scrollableSection.scrollWidth;
      this.scrollEvent(new Event("dummyResizeEvent"));
    }
    
    scrollEvent(event) {
      let scrollPercent = this.scrollWrapper.scrollLeft / (this.scrollableWidth - this.wrapperWidth);
      let scrollbarLeft = scrollPercent * (this.scrollbarWrapperWidth - this.scrollbar.clientWidth);
      const left=`translateX(${scrollbarLeft}px)`;
      if (this.scrollWrapper.scrollLeft >= this.scrollLeft) {
        this.scrollbar.style.transform = left;
      }
      else {
        if (this.scrollWrapper.scrollLeft < this.scrollLeft) {
          this.scrollbar.style.transform = left + " scaleX(-1)";
        }
        this.scrollLeft = this.scrollWrapper.scrollLeft;
      }
    }

    resetTouch() {
      this.swipeStartX=0;
      this.swipeStartY=0;
      this.swipeDiffX=0;
      this.swipeDiffY=0;
    }
    
    handleTouchEnd(event) {
      if (Math.abs(this.swipeDiffY) > Math.abs(this.swipeDiffX)) {
        if (Math.abs(this.swipeDiffY) > HexList.gestureThreshhold) {
          if (this.swipeDiffY < 0 ) {
            this.closeHex(new Event("closeHexGestureEvent"));
          }
        }
      }
      
      this.card.style.transform = "";
      this.swipeStartX = 0;
      this.swipeStartY = 0;
    }
    
    handleTouchStart(event) {
      this.swipeStartX = event.touches[0].clientX;
      this.swipeStartY = event.touches[0].clientY;
      this.swipeDiffX = 0;
      this.swipeDiffY = 0;
    }
    
    handleTouchMove(event) {
      if (!this.swipeStartX || !this.swipeStartY) {
        return;
      }
      
      var xUp = event.touches[0].clientX;
      var yUp = event.touches[0].clientY;
      this.swipeDiffX = this.swipeStartX - xUp;
      this.swipeDiffY = this.swipeStartY - yUp;
      
      if (this.card && Math.abs(this.swipeDiffY) > Math.abs(this.swipeDiffX)) {
        if(this.swipeDiffY < 0) {
          this.card.style.transform = `translateY(${-this.swipeDiffY}px)`;
        }
      }
      event.preventDefault();
    }
    
    getWistiaVideoHandle() {
      const firstWistiaVideo = this.wrapperEl.querySelector(".wistia_embed");
      if (firstWistiaVideo instanceof HTMLElement) {
        window._wq = window._wq||[];
        _wq.push({
          id:"r15-video-player",
          onEmbedded:(video) => {
            this.cardWistiaVideoPlayer=video;
          }
        });
      }
    }
    
    replaceMedia (hex) {
      if (hex.getAttribute("data-video-hash") != "") {
        const hashId = hex.getAttribute("data-video-hash");
        this.replaceWistiaVideo(hashId);
        this.imageContainer.classList.add("hidden");
        
        while (this.imageContainer.firstChild) {
          this.imageContainer.removeChild( this.imageContainer.firstChild);
        }
        this.videoContainer.classList.remove("hidden");
      }
      else {
        if (hex.getAttribute("data-image") != "") {
          const img = document.createElement("img");
          img.setAttribute("src", hex.getAttribute("data-image"));
          img.setAttribute("loading", "eager");
          img.setAttribute("width","800");
          img.setAttribute("height","446");
          this.imageContainer.appendChild(img);
          this.imageContainer.classList.remove("hidden");
          this.videoContainer.classList.add("hidden");
        }
      }
    }
    
    replaceWistiaVideo(hashId) {
      if (this.cardWistiaVideoPlayer) {
        this.cardWistiaVideoPlayer.replaceWith(hashId, {
          autoPlay:true,
          playbar:false,
          videoFoam:true
        });
        this.cardWistiaVideoPlayer.play();
      }
      else {
        console.warn("Wistia Video Player is not set");
      }
    }
      
      constructor(wrapperIn) {
        this.filterOpen = false;
        this.wrapperEl = wrapperIn;
        this.filterEl = this.wrapperEl.querySelector(".r15__filter");
        this.filterText = this.filterEl.querySelector(".r15__filter--text");
        this.filterDropdown = this.wrapperEl.querySelector(".grid-dropdown");
        this.filterOverlay = this.filterDropdown.querySelector(".grid-dropdown__overlay");
        this.filterOptions = this.filterDropdown.querySelectorAll(".grid-dropdown__category");
        this.wrapperEl.addEventListener("click", this.closeHex.bind(this));
        this.scrollWrapper = this.wrapperEl.querySelector(".r15--scroll-wrapper");
        this.centerScroll();
        this.scrollbar = this.wrapperEl.querySelector(".scrollbar");
        this.resizeContainer();
        this.scrollWrapper.addEventListener("scroll", this.scrollEvent.bind(this));
        this.hexes = this.wrapperEl.querySelectorAll(".hex");
        this.card = this.wrapperEl.querySelector(".r15--card");
        this.videoContainer = this.card.querySelector(".r15--card__video");
        this.imageContainer = this.card.querySelector(".r15--card__image");
        this.filterEl.addEventListener("click", this.toggleFilter.bind(this));
        this.filterOverlay.addEventListener("click", this.closeFilter.bind(this));
        this.filterOptions.forEach((option) => {
          option.addEventListener("click", this.setFilter.bind(this));
        });
        this.hexes.forEach((hex) => {
          const inside = hex.querySelector("map area");
          if (inside) {
            inside.addEventListener("click",this.openHex.bind(this));
          }
          const mobileInside = hex.querySelector(".hex-inner");
          if (mobileInside) {
            mobileInside.addEventListener("click", this.openHex.bind(this));
          }
        });
        this.getWistiaVideoHandle();
        this.card.addEventListener("touchstart", this.handleTouchStart.bind(this), {passive:true});
        this.card.addEventListener("touchmove", this.handleTouchMove.bind(this), {passive:true});
        this.card.addEventListener("touchend", this.handleTouchEnd.bind(this));
        this.card.addEventListener("touchcancel", this.handleTouchEnd.bind(this));
      }
    }
    Drupal.behaviors.r15CapGrid = {
      attach(context) {
        const hexLists = context.querySelectorAll(".r15-cap-grid");
        hexLists.forEach((hexList) => {
          const list = new HexList(hexList);
          const respondToViewPortChange = Drupal.debounce(list.resizeContainer.bind(list), 250);
          window.addEventListener("resize", respondToViewPortChange);
        });
      }};
})(Drupal);
