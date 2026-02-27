# Docker setup

## 1) Requisitos
- Docker Desktop instalado y ejecutándose.

## 2) Configurar variables
- Copia `.env.example` a `.env` en la raíz del proyecto.
- Ajusta usuario/password/puertos si lo necesitas.

## 3) Levantar todo
```bash
docker compose up --build
```

## 4) Accesos
- Frontend: `http://localhost:3000`
- Backend (API): `http://localhost:5000`

## 5) Apagar
```bash
docker compose down
```

## 6) Apagar y borrar datos de PostgreSQL
```bash
docker compose down -v
```
