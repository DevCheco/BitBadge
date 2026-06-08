document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('upload-form');
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('pdf');
  const fileMsg = dropArea.querySelector('.file-msg');
  const submitBtn = document.getElementById('submit-btn');
  const statusMsg = document.getElementById('status-msg');
  const certList = document.getElementById('cert-list');

  // Cargar lista inicial
  loadCertificates();

  // Efectos del área de drag & drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('is-active'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('is-active'), false);
  });

  dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0 && files[0].type === 'application/pdf') {
      fileInput.files = files;
      updateFileMsg(files[0].name);
    } else {
      showStatus('Por favor, selecciona solo un archivo PDF.', 'error');
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      updateFileMsg(e.target.files[0].name);
    }
  });

  function updateFileMsg(name) {
    fileMsg.textContent = `Archivo seleccionado: ${name}`;
    fileMsg.style.color = 'var(--accent)';
  }

  // Manejo del formulario
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (fileInput.files.length === 0) {
      showStatus('Debes seleccionar un PDF.', 'error');
      return;
    }

    const formData = new FormData(uploadForm);
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subiendo...';
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showStatus('¡Certificado guardado exitosamente!', 'success');
        uploadForm.reset();
        fileMsg.textContent = 'Arrastra tu PDF aquí o haz clic para seleccionar';
        fileMsg.style.color = '';
        loadCertificates(); // Recargar lista
      } else {
        showStatus(result.error || 'Ocurrió un error al subir.', 'error');
      }
    } catch (error) {
      showStatus('Error de conexión con el servidor.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar Certificado';
    }
  });

  function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = `status-msg ${type}`;
    setTimeout(() => {
      statusMsg.textContent = '';
      statusMsg.className = 'status-msg';
    }, 5000);
  }

  // Cargar y mostrar lista
  async function loadCertificates() {
    try {
      const response = await fetch('/api/certificates');
      const data = await response.json();
      
      certList.innerHTML = '';
      
      if (data.length === 0) {
        certList.innerHTML = '<p class="loading">No hay certificados subidos.</p>';
        return;
      }
      
      // Mostrar del más nuevo al más viejo
      data.reverse().forEach(cert => {
        const item = document.createElement('div');
        item.className = 'cert-item';
        item.innerHTML = `
          <div class="cert-item-info">
            <h3>${cert.title}</h3>
            <p>${cert.issuer}</p>
          </div>
          <button class="btn-delete" data-id="${cert.id}">Eliminar</button>
        `;
        
        item.querySelector('.btn-delete').addEventListener('click', () => deleteCertificate(cert.id));
        certList.appendChild(item);
      });
    } catch (error) {
      certList.innerHTML = '<p class="error">Error al cargar la lista.</p>';
    }
  }

  // Eliminar certificado
  async function deleteCertificate(id) {
    if (!confirm('¿Estás seguro de eliminar este certificado? Esta acción no se puede deshacer.')) return;
    
    try {
      const response = await fetch(`/api/certificates/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadCertificates();
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  }
});
