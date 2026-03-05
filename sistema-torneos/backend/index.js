const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = Number.parseInt(process.env.PORT, 10) || 5000;
// Increased body limit to support logo base64 + historical uploads in one payload
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

// Conexion a PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

// Importar Modelos
const Puntaje = require('./models/Puntaje')(sequelize);
const Usuario = require('./models/Usuario')(sequelize);
const Publicacion = require('./models/Publicacion')(sequelize);
const PromocionUsuario = require('./models/PromocionUsuario')(sequelize);

const toYear = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : new Date().getFullYear();
};

const ARBITRO_SECRET = process.env.ARBITRO_SECRET || 'ARBITRO2026';

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

// Publicar datos (categorias, promociones con logos, calendario) - evita limites de localStorage
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

    // Si existen duplicados por ano, actualiza el mas reciente para mantener coherencia.
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

    // Vuelve a leer la publicacion para garantizar que se devuelven los datos mas recientes
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

    // Si piden un ano especifico, buscar ese. Si no, buscar el mas reciente.
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

// Obtener lista de anos disponibles
app.get('/api/anios', async (req, res) => {
  try {
    const years = await Publicacion.findAll({
      attributes: ['anio'],
      order: [['anio', 'DESC']],
    });
    res.json(years.map((y) => y.anio));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta: Registro con validacion de codigo de arbitro
app.post('/api/register', async (req, res) => {
  try {
    const usuario = String(req.body?.usuario || req.body?.nombre || '').trim();
    const email = String(req.body?.email || `${usuario}@local.torneo`).trim().toLowerCase();
    const password = String(req.body?.password || '').trim();
    const rol = req.body?.rol === 'arbitro' ? 'arbitro' : 'organizador';
    const codigoSecret = String(req.body?.codigoSecret || '').trim();

    if (!usuario || !password) {
      return res.status(400).json({ mensaje: 'Completa usuario y contrasena.' });
    }

    if (rol === 'arbitro' && codigoSecret !== ARBITRO_SECRET) {
      return res.status(401).json({ mensaje: 'Codigo de arbitro incorrecto' });
    }

    const existente = await Usuario.findOne({ where: { nombre: usuario } });
    if (existente) {
      return res.status(409).json({ mensaje: 'Ese usuario ya existe.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const nuevo = await Usuario.create({
      nombre: usuario,
      email,
      password: hashed,
      rol,
    });

    return res.json({
      mensaje: 'Usuario registrado con exito',
      usuario: nuevo.nombre,
      rol: nuevo.rol,
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo registrar el usuario.', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const usuario = String(req.body?.usuario || '').trim();
    const password = String(req.body?.password || '').trim();

    if (!usuario || !password) {
      return res.status(400).json({ mensaje: 'Completa usuario y contrasena.' });
    }

    const user = await Usuario.findOne({ where: { nombre: usuario } });
    if (!user) {
      return res.status(401).json({ mensaje: 'Credenciales invalidas.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ mensaje: 'Credenciales invalidas.' });
    }

    return res.json({
      usuario: user.nombre,
      rol: user.rol || 'organizador',
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo iniciar sesion.', error: error.message });
  }
});

app.post('/api/promo/register', async (req, res) => {
  try {
    const numero = String(req.body?.numero || '').trim();
    const alias = String(req.body?.alias || '').trim();
    const password = String(req.body?.password || '').trim();
    const anio = toYear(req.body?.anio);

    if (!numero || !alias || !password) {
      return res.status(400).json({ mensaje: 'Completa numero, alias y contrasena.' });
    }

    const existente = await PromocionUsuario.findOne({ where: { numero, anio } });
    if (existente) {
      return res.status(409).json({ mensaje: 'Ese numero de promocion ya esta registrado.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const nuevo = await PromocionUsuario.create({
      numero,
      alias,
      password: hashed,
      anio,
    });

    return res.json({
      numero: nuevo.numero,
      alias: nuevo.alias,
      anio: nuevo.anio,
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo registrar la promocion.', error: error.message });
  }
});

app.post('/api/promo/login', async (req, res) => {
  try {
    const numero = String(req.body?.numero || '').trim();
    const password = String(req.body?.password || '').trim();
    const anio = toYear(req.body?.anio);

    if (!numero || !password) {
      return res.status(400).json({ mensaje: 'Completa numero y contrasena.' });
    }

    const user = await PromocionUsuario.findOne({ where: { numero, anio } });
    if (!user) {
      return res.status(401).json({ mensaje: 'Credenciales invalidas.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ mensaje: 'Credenciales invalidas.' });
    }

    return res.json({
      numero: user.numero,
      alias: user.alias || '',
      anio: user.anio,
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo iniciar sesion.', error: error.message });
  }
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
      console.error(`Intento ${attempt}/${maxRetries} de conexion a DB fallo:`, error.message);
      if (attempt === maxRetries) {
        console.error('No se pudo conectar a la base de datos tras varios intentos. Cerrando proceso.');
        process.exit(1);
      }
      await wait(retryDelayMs);
    }
  }
};

startServer();
