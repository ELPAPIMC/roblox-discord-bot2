// Bot de Discord para notificaciones del foro de Roblox
// Autor: Asistente Claude
// Versión: 1.0

const https = require('https');
const http = require('http');

// ==================== CONFIGURACIÓN ====================
const CONFIG = {
  WEBHOOK_URL: 'https://discordapp.com/api/webhooks/1434599533144178700/Px8kcPHvxS1tJmDiw3rEpQ_FurDkhipBUuuwOhWm91KEs7M6iKxuDd0Npe1uCEECm33i',
  GROUP_ID: '35815907',
  CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutos en milisegundos
  ROBLOX_API_BASE: 'https://groups.roblox.com/v2/groups',
  MAX_RETRIES: 3,
  RETRY_DELAY: 10000 // 10 segundos
};

// ==================== ALMACENAMIENTO ====================
let processedPosts = new Set();
let isFirstRun = true;

// ==================== UTILIDADES ====================
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, options, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function sendWebhook(data) {
  return new Promise((resolve, reject) => {
    const url = new URL(CONFIG.WEBHOOK_URL);
    const payload = JSON.stringify(data);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`Webhook error ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function truncateText(text, maxLength = 1000) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// ==================== FUNCIONES PRINCIPALES ====================
async function fetchForumPosts(retryCount = 0) {
  try {
    const url = `${CONFIG.ROBLOX_API_BASE}/${CONFIG.GROUP_ID}/wall/posts?sortOrder=Desc&limit=10`;
    
    console.log(`[${new Date().toISOString()}] Consultando foro de Roblox...`);
    
    const response = await makeRequest(url, {
      headers: {
        'User-Agent': 'RobloxForumBot/1.0'
      }
    });
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Formato de respuesta inválido');
    }
    
    return response.data;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error al obtener posts:`, error.message);
    
    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(`Reintentando en ${CONFIG.RETRY_DELAY/1000} segundos... (Intento ${retryCount + 1}/${CONFIG.MAX_RETRIES})`);
      await sleep(CONFIG.RETRY_DELAY);
      return fetchForumPosts(retryCount + 1);
    }
    
    throw error;
  }
}

async function sendDiscordNotification(post) {
  const embed = {
    embeds: [{
      title: '📢 Nuevo Estafador',
      description: truncateText(post.body),
      color: 0x00A2FF, // Color azul de Roblox
      fields: [
        {
          name: '👤 Autor',
          value: post.poster?.username || 'Usuario desconocido',
          inline: true
        },
        {
          name: '📅 Fecha',
          value: formatDate(post.created),
          inline: true
        }
      ],
      footer: {
        text: `ID del Post: ${post.id}`
      },
      timestamp: post.created,
      url: `https://www.roblox.com/groups/${CONFIG.GROUP_ID}`
    }]
  };
  
  try {
    await sendWebhook(embed);
    console.log(`[${new Date().toISOString()}] ✅ Notificación enviada para post ${post.id}`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error al enviar webhook:`, error.message);
    return false;
  }
}

async function checkForNewPosts() {
  try {
    const posts = await fetchForumPosts();
    
    if (!posts || posts.length === 0) {
      console.log(`[${new Date().toISOString()}] No se encontraron posts en el foro`);
      return;
    }
    
    // En la primera ejecución, solo almacenar los IDs sin enviar notificaciones
    if (isFirstRun) {
      posts.forEach(post => processedPosts.add(post.id));
      console.log(`[${new Date().toISOString()}] Inicialización: ${processedPosts.size} posts registrados`);
      isFirstRun = false;
      return;
    }
    
    // Verificar posts nuevos (de más reciente a más antiguo)
    let newPostsCount = 0;
    for (const post of posts) {
      if (!processedPosts.has(post.id)) {
        await sendDiscordNotification(post);
        processedPosts.add(post.id);
        newPostsCount++;
        
        // Pequeña pausa entre notificaciones para evitar rate limits
        await sleep(1000);
      }
    }
    
    if (newPostsCount > 0) {
      console.log(`[${new Date().toISOString()}] 🎉 ${newPostsCount} nuevo(s) post(s) detectado(s)`);
    } else {
      console.log(`[${new Date().toISOString()}] No hay posts nuevos`);
    }
    
    // Limpiar posts antiguos del Set (mantener solo los últimos 100)
    if (processedPosts.size > 100) {
      const postsArray = Array.from(processedPosts);
      processedPosts = new Set(postsArray.slice(-100));
    }
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ⚠️ Error en verificación:`, error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== SERVIDOR HTTP (para servicios cloud) ====================
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      uptime: process.uptime(),
      postsMonitored: processedPosts.size,
      lastCheck: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;

// ==================== INICIO DEL BOT ====================
async function startBot() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  Bot de Notificaciones Foro Roblox       ║');
  console.log('║  Versión 1.0                              ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log(`📋 Configuración:`);
  console.log(`   - Grupo ID: ${CONFIG.GROUP_ID}`);
  console.log(`   - Intervalo: ${CONFIG.CHECK_INTERVAL/1000/60} minutos`);
  console.log(`   - Webhook configurado: ✓`);
  console.log('');
  
  // Enviar mensaje de inicio
  try {
    await sendWebhook({
      embeds: [{
        title: '🤖 Bot de Notificaciones Iniciado',
        description: `El bot está monitoreando el foro del grupo **${CONFIG.GROUP_ID}**`,
        color: 0x00FF00,
        timestamp: new Date().toISOString()
      }]
    });
    console.log(`[${new Date().toISOString()}] ✅ Mensaje de inicio enviado`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ⚠️ No se pudo enviar mensaje de inicio:`, error.message);
  }
  
  // Iniciar servidor HTTP
  server.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] 🌐 Servidor HTTP escuchando en puerto ${PORT}`);
  });
  
  // Primera verificación inmediata
  await checkForNewPosts();
  
  // Verificación periódica
  setInterval(checkForNewPosts, CONFIG.CHECK_INTERVAL);
  
  console.log(`[${new Date().toISOString()}] 🔄 Monitoreo activo`);
  console.log('');
}

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error(`[${new Date().toISOString()}] 💥 Error no capturado:`, error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[${new Date().toISOString()}] 💥 Promesa rechazada:`, reason);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] 🛑 Señal SIGTERM recibida, cerrando...`);
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

// Iniciar el bot
startBot();
