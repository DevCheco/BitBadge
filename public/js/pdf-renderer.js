// Inicializar PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

class PDFRenderer {
  /**
   * Renderiza la primera página de un PDF en un canvas
   * @param {string} url - Ruta al archivo PDF
   * @param {HTMLCanvasElement} canvas - Elemento canvas donde se dibujará
   */
  static async renderPdfToCanvas(url, canvas) {
    try {
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      
      // Obtener la primera página
      const page = await pdf.getPage(1);
      
      const ctx = canvas.getContext('2d');
      
      // Ajustar escala para alta resolución (retina)
      const viewport = page.getViewport({ scale: 2.0 });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
    } catch (error) {
      console.error('Error renderizando el PDF:', error);
      
      // Fallback visual si falla la carga
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 600;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '30px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Error al cargar el PDF', canvas.width/2, canvas.height/2);
    }
  }
}
