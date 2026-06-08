class CertificateSlider {
  constructor(data, trackId, dotsId, prevBtnId, nextBtnId) {
    this.data = data;
    this.track = document.getElementById(trackId);
    this.dotsContainer = document.getElementById(dotsId);
    this.prevBtn = document.getElementById(prevBtnId);
    this.nextBtn = document.getElementById(nextBtnId);
    
    this.currentIndex = 0;
    this.slides = [];
    this.dots = [];
  }

  async init() {
    this.buildSlides();
    this.buildDots();
    this.addEventListeners();
    this.updateSlider();
    
    // Renderizar PDFs después de crear el DOM
    await this.renderAllPdfs();
  }

  buildSlides() {
    this.data.forEach((cert, index) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      
      slide.innerHTML = `
        <div class="cert-frame">
          <div class="cert-mat">
            <div class="cert-canvas-container">
              <canvas id="canvas-${cert.id}"></canvas>
            </div>
          </div>
        </div>
        <div class="cert-info">
          <h2 class="cert-title">${cert.title}</h2>
          <p class="cert-issuer">${cert.issuer}</p>
          <a href="${cert.pdfUrl}" target="_blank" class="btn-open-pdf">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
            </svg>
            Ver PDF
          </a>
        </div>
      `;
      
      this.track.appendChild(slide);
      this.slides.push(slide);
    });
  }

  buildDots() {
    this.data.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.addEventListener('click', () => this.goToSlide(index));
      this.dotsContainer.appendChild(dot);
      this.dots.push(dot);
    });
  }

  addEventListeners() {
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
  }

  async renderAllPdfs() {
    for (const cert of this.data) {
      const canvas = document.getElementById(`canvas-${cert.id}`);
      if (canvas) {
        await PDFRenderer.renderPdfToCanvas(cert.pdfUrl, canvas);
      }
    }
  }

  goToSlide(index) {
    if (index < 0 || index >= this.slides.length) return;
    this.currentIndex = index;
    this.updateSlider();
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateSlider();
    }
  }

  next() {
    if (this.currentIndex < this.slides.length - 1) {
      this.currentIndex++;
      this.updateSlider();
    }
  }

  updateSlider() {
    // Mover el track principal
    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    // Actualizar clases activas en slides y puntos
    this.slides.forEach((slide, index) => {
      if (index === this.currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    this.dots.forEach((dot, index) => {
      if (index === this.currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Actualizar estado de botones
    this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.5' : '1';
    this.prevBtn.style.pointerEvents = this.currentIndex === 0 ? 'none' : 'auto';
    
    this.nextBtn.style.opacity = this.currentIndex === this.slides.length - 1 ? '0.5' : '1';
    this.nextBtn.style.pointerEvents = this.currentIndex === this.slides.length - 1 ? 'none' : 'auto';
  }
}
