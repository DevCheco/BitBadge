document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/certificates');
    const certificatesData = await response.json();

    if (certificatesData && certificatesData.length > 0) {
      const slider = new CertificateSlider(
        certificatesData,
        'slider-track',
        'slider-dots',
        'prev-btn',
        'next-btn'
      );
      
      await slider.init();
    } else {
      console.warn('No hay certificados para mostrar.');
      document.getElementById('slider-track').innerHTML = '<div style="text-align:center; width:100%; padding:2rem; color:var(--text-secondary)">No hay certificados disponibles. Añade uno desde el <a href="/admin" style="color:var(--accent); text-decoration:underline;">Dashboard</a>.</div>';
    }
  } catch (error) {
    console.error('Error al cargar los datos del servidor:', error);
    document.getElementById('slider-track').innerHTML = '<div style="text-align:center; width:100%; padding:2rem; color:#f87171">Error de conexión. Asegúrate de ejecutar "node server.js".</div>';
  }
});
