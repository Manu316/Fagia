const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // === INICIO DE LA CONFIGURACIÓN DE PROXY PARA CORS ===
  devServer: {
    proxy: {
      '^/': { // Esto proxyará todas las solicitudes que no sean de tu frontend (ej. /login, /aliments)
        target: 'http://localhost:8080', // La URL de tu backend Rust
        ws: true, // Habilita el soporte para WebSockets
        changeOrigin: true // Necesario para proxies basados en nombres
      }
    }
  }
  // === FIN DE LA CONFIGURACIÓN DE PROXY PARA CORS ===
})