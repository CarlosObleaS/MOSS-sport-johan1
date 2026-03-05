const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = Number.parseInt(process.env.PORT, 10) || 5000;
// Increased body limit to support logo base64 + historical uploads in one payload
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

// Conexión a PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

// Importar Modelos
const Puntaje = require('./models/Puntaje')(sequelize);
const Usuario = require('./models/Usuario')(sequelize);
const Publicacion = require('./models/Publicacion')(sequelize);

const toYear = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : new Date().getFullYear();
};

// Ruta: Obtener Ranking General (Ordenado por el total calculado)
app.get('/api/ranking', async (req, res) => {
  try {
    const resultados = await Puntaje.findAll();
    // Ordenar manualmente por el campo virtual puntaje_total
    const ranking = resultados.sort((a, b) => b.puntaje_total - a.puntaje_total);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Publicar datos (categorias, promociones con logos, calendario) - evita límites de localStorage
app.post('/api/publicar', async (req, res) => {
  try {
    const { payload, anio } = req.body;
    const year = toYear(anio);
    const safePayload = payload && typeof payload === 'object' ? payload : {};

    const data = {
      ...safePayload,
      calendario: safePayload.calendario || {},
      publicadoEn: safePayload.publicadoEn || new Date().toISOString(),
    };

    // Si existen duplicados por año, actualiza el más reciente para mantener coherencia.
    const pubs = await Publicacion.findAll({
      where: { anio: year },
      order: [['updatedAt', 'DESC'], ['id', 'DESC']],
    });

    let pub = pubs[0] || null;
    if (pub) {
      await pub.update({ payload: data, anio: year });
    } else {
      pub = await Publicacion.create({ payload: data, anio: year });
    }

    // Vuelve a leer la publicación para garantizar que se devuelven los datos más recientes
    const savedPub = await Publicacion.findOne({
      where: { anio: year },
      order: [['updatedAt', 'DESC'], ['id', 'DESC']],
    });

    res.json({ ok: true, payload: savedPub.payload, anio: savedPub.anio });
  } catch (error) {
    console.error('Error publicar:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/publicar', async (req, res) => {
  try {
    const { anio } = req.query;
    const hasYear = typeof anio !== 'undefined' && String(anio).trim() !== '';
    const whereClause = hasYear ? { anio: toYear(anio) } : {};

    // Si piden un año específico, buscar ese. Si no, buscar el más reciente.
    const pub = await Publicacion.findOne({
      where: whereClause,
      order: [['anio', 'DESC'], ['updatedAt', 'DESC'], ['id', 'DESC']]
    });

    if (!pub) return res.json(null);
    res.json({ ...pub.payload, anio: pub.anio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener lista de años disponibles
app.get('/api/anios', async (req, res) => {
  try {
    const years = await Publicacion.findAll({
      attributes: ['anio'],
      order: [['anio', 'DESC']],
    });
    res.json(years.map(y => y.anio));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta: Registro con validación de código de árbitro
app.post('/api/register', async (req, res) => {
  const { nombre, email, password, rol, codigoSecret } = req.body;

  if (rol === 'arbitro' && codigoSecret !== "Bolo2026") { // Código que tú definas
    return res.status(401).json({ mensaje: "Código de árbitro incorrecto" });
  }

  // Lógica para guardar usuario (usar bcrypt para password en producción)
  res.json({ mensaje: "Usuario registrado con éxito" });
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startServer = async () => {
  const maxRetries = Number.parseInt(process.env.DB_CONNECT_RETRIES || '30', 10);
  const retryDelayMs = Number.parseInt(process.env.DB_CONNECT_RETRY_DELAY_MS || '2000', 10);

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });
      app.listen(PORT, () => console.log(`Servidor en puerto ${PORT} y DB sincronizada (schema updated)`));
      return;
    } catch (error) {
      console.error(`Intento ${attempt}/${maxRetries} de conexión a DB falló:`, error.message);
      if (attempt === maxRetries) {
        console.error('No se pudo conectar a la base de datos tras varios intentos. Cerrando proceso.');
        process.exit(1);
      }
      await wait(retryDelayMs);
    }
  }
};

startServer();


