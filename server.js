const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuración de middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname)));

// Configuración de Multer para guardar archivos en assets/pdfs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'assets', 'pdfs'));
  },
  filename: (req, file, cb) => {
    // Generar un nombre único para evitar sobrescribir
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF.'));
    }
  }
});

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para el dashboard de administración
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// API: Obtener certificados
app.get('/api/certificates', (req, res) => {
  const dataPath = path.join(__dirname, 'data', 'certificates.json');
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al leer los certificados.' });
    }
    res.json(JSON.parse(data));
  });
});

// API: Subir nuevo certificado
app.post('/api/upload', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo PDF.' });
    }

    const { title, issuer } = req.body;
    
    if (!title || !issuer) {
      // Si falta info, intentamos borrar el archivo huérfano
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Faltan datos (título o emisor).' });
    }

    const newPdfUrl = `assets/pdfs/${req.file.filename}`;
    const dataPath = path.join(__dirname, 'data', 'certificates.json');

    // Leer JSON actual
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Crear nuevo objeto
    const newCert = {
      id: data.length > 0 ? Math.max(...data.map(c => c.id)) + 1 : 1,
      title: title,
      issuer: issuer,
      pdfUrl: newPdfUrl
    };

    // Añadir y guardar
    data.push(newCert);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    res.json({ success: true, certificate: newCert });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// API: Eliminar un certificado (opcional para el dashboard)
app.delete('/api/certificates/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const dataPath = path.join(__dirname, 'data', 'certificates.json');
  
  try {
    let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const certIndex = data.findIndex(c => c.id === id);
    
    if (certIndex === -1) {
      return res.status(404).json({ error: 'Certificado no encontrado.' });
    }
    
    // Eliminar archivo físico
    const pdfPath = path.join(__dirname, data[certIndex].pdfUrl);
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
    
    // Eliminar del array
    data.splice(certIndex, 1);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar certificado.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Dashboard de administración en http://localhost:${PORT}/admin`);
});
