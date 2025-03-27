<template>
  <div class="login-container">
    <h2>Inicio de sesión</h2>
    <form @submit.prevent="login">
      <div>
        <label for="username">Usuario:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">Contraseña:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">Ingresar</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
export default {
  name: "UserLogin",
  data() {
    return {
      username: '',
      password: '',
      error: ''
    };
  },
  methods: {
    login() {
      if (this.username === 'admin' && this.password === '1234') {
        this.$emit('login-success', this.username);
        this.error = '';
      } else {
        this.error = 'Usuario o contraseña incorrectos';
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 1500px;
  margin: auto;
  padding: 299px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}
.error {
  color: red;
}
</style>