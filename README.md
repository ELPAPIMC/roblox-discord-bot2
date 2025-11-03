# 🚂 Guía Rápida: Desplegar en Railway (5 minutos)

Railway es la forma más fácil y rápida de tener tu bot funcionando 24/7 gratis.

## 📋 Antes de empezar

✅ Webhook de Discord configurado
✅ Archivos `bot.js` y `package.json` listos
✅ Cuenta de GitHub (opcional pero recomendado)

---

## 🎯 Método 1: Con GitHub (Recomendado)

### Paso 1: Sube tu código a GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Click en "New repository"
3. Nombre: `roblox-discord-bot`
4. Hazlo **privado** (para proteger tu webhook)
5. Click "Create repository"

6. Sube tus archivos:
   - Click en "uploading an existing file"
   - Arrastra `bot.js` y `package.json`
   - Click "Commit changes"

### Paso 2: Despliega en Railway

1. Ve a [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Inicia sesión con GitHub
4. Click "Deploy from GitHub repo"
5. Selecciona `roblox-discord-bot`
6. Railway automáticamente:
   - Detecta que es Node.js
   - Instala dependencias
   - Ejecuta `npm start`

### Paso 3: Verifica

1. Ve a la pestaña "Deployments"
2. Verás logs como:
   ```
   ╔════════════════════════════════════════════╗
   ║  Bot de Notificaciones Foro Roblox       ║
   ║  Versión 1.0                              ║
   ╚════════════════════════════════════════════╝
   ```
3. En Discord verás: "🤖 Bot de Notificaciones Iniciado"

**¡Listo! Tu bot está corriendo 24/7** 🎉

---

## 🎯 Método 2: Sin GitHub (Manual)

### Paso 1: Instala Railway CLI

```bash
npm install -g @railway/cli
```

### Paso 2: Login

```bash
railway login
```

Esto abrirá tu navegador para autenticarte.

### Paso 3: Inicializa proyecto

En la carpeta de tu bot:

```bash
railway init
```

Dale un nombre: `roblox-discord-bot`

### Paso 4: Despliega

```bash
railway up
```

Esto subirá todos tus archivos a Railway.

### Paso 5: Abre el proyecto

```bash
railway open
```

Esto abrirá tu navegador en el dashboard de Railway.

**¡Listo! Tu bot está corriendo 24/7** 🎉

---

## 📊 Monitorear tu Bot

### Ver logs en tiempo real:

**Desde Railway CLI:**
```bash
railway logs
```

**Desde el navegador:**
1. Ve a [railway.app](https://railway.app)
2. Click en tu proyecto
3. Pestaña "Deployments"
4. Click en el deployment activo
5. Verás los logs en tiempo real

### Ver estado de salud:

1. En Railway, ve a "Settings"
2. Copia el "Public Domain" (algo como `roblox-discord-bot-production.up.railway.app`)
3. Abre en tu navegador: `https://tu-dominio.railway.app/health`

Verás:
```json
{
  "status": "online",
  "uptime": 3600,
  "postsMonitored": 45,
  "lastCheck": "2025-11-03T10:30:00.000Z"
}
```

---

## ⚙️ Configuración Adicional

### Variables de entorno (opcional)

Si quieres cambiar configuración sin editar código:

1. En Railway, ve a "Variables"
2. Agrega:
   - `GROUP_ID` = `35815907`
   - `CHECK_INTERVAL` = `300000` (5 minutos en ms)

3. Modifica `bot.js` para usar estas variables:
```javascript
const CONFIG = {
  GROUP_ID: process.env.GROUP_ID || '35815907',
  CHECK_INTERVAL: parseInt(process.env.CHECK_INTERVAL) || 5 * 60 * 1000,
  // ...
};
```

### Actualizar el bot

**Con GitHub:**
1. Edita los archivos en GitHub
2. Railway desplegará automáticamente

**Con Railway CLI:**
```bash
railway up
```

---

## 💰 Límites del Plan Gratuito

Railway ofrece **gratuitamente**:
- ✅ 500 horas de ejecución/mes (~20 días)
- ✅ $5 de crédito/mes
- ✅ Despliegues ilimitados

**Esto es más que suficiente para este bot** 🎉

Para uso 24/7 todo el mes, considera:
- Plan Hobby: $5/mes (vale la pena)
- O usa múltiples servicios (Railway + Render = ~40 días gratis)

---

## 🔧 Solución de Problemas

### "Build failed"

1. Verifica que `package.json` está en el repositorio
2. Verifica que `bot.js` no tiene errores de sintaxis
3. Revisa los logs de build en Railway

### "Application crashed"

1. Ve a los logs en Railway
2. Busca el error específico
3. Usualmente es un problema con el webhook o la API

### El bot no responde después de horas

**Causa**: Plan gratuito se quedó sin horas

**Solución**:
1. Espera al siguiente mes (se resetea el 1º)
2. Usa otro servicio (Render.com)
3. Upgrade a plan Hobby ($5/mes)

### No veo logs

1. Asegúrate de estar en el deployment correcto
2. El bot puede tardar 1-2 minutos en iniciar
3. Refresca la página

---

## 🎯 Checklist Final

Antes de cerrar, verifica:

- [ ] Bot desplegado en Railway ✅
- [ ] Mensaje de inicio recibido en Discord ✅
- [ ] Logs muestran "Monitoreo activo" ✅
- [ ] Health endpoint responde ✅
- [ ] Webhook funciona correctamente ✅

---

## 🚀 Próximos Pasos

1. **Deja el bot corriendo** - Railway lo mantendrá activo
2. **Pruébalo** - Publica algo en el foro de Roblox
3. **Monitorea** - Revisa Discord en 5 minutos
4. **Disfruta** - El bot trabajará automáticamente

---

## 📞 Ayuda Rápida

**Bot no envía notificaciones después de 10 minutos:**
```bash
railway logs
```
Busca errores en los logs

**Quiero cambiar el intervalo de verificación:**
1. Edita `bot.js`
2. Cambia `CHECK_INTERVAL: 5 * 60 * 1000` al valor que quieras
3. `railway up` (o push a GitHub)

**Quiero detener el bot:**
```bash
railway down
```

---

## ✅ Listo

¡Tu bot está completamente configurado y funcionando 24/7!

Cada 5 minutos verificará automáticamente el foro y te notificará en Discord de cualquier post nuevo.

**¡Disfruta!** 🎉
