const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // === INICIO DE LA CONFIGURACIÓN DE PROXY PARA CORS ===
  devServer: {
    proxy: {
      '^/': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true 
      }
    }
  }
})