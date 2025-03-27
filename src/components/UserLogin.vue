<template>
  <div class="login-container">
    <img src="@/assets/Fagia.png" alt="Fagia Logo" class="logo" />
    <h2>Inicio de sesión</h2>
    <form @submit.prevent="login">
      <div class="input-group">
        <label for="username">
          <i class="icon">👤</i>
          <input type="text" id="username" v-model="username" placeholder="Usuario" required />
        </label>
      </div>
      <div class="input-group">
        <label for="password">
          <i class="icon">🔒</i>
          <input type="password" id="password" v-model="password" placeholder="Contraseña" required />
        </label>
      </div>
      <div class="options">
        <label>
          <input type="checkbox" v-model="rememberMe" /> Recuérdame
        </label>
        <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
      </div>
      <button type="submit" class="login-button">Ingresar</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
export default {
  name: "UserLogin",
  data() {
    return {
      username: "",
      password: "",
      rememberMe: false,
      error: "",
    };
  },
  methods: {
    login() {
      if (this.username === "admin" && this.password === "1234") {
        this.$emit("login-success", this.username);
        this.error = "";
      } else {
        this.error = "Usuario o contraseña incorrectos";
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  text-align: center;
  background-color: #1C1C1C;
  color: #fff;
}

.logo {
  width: 100px;
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  border: 1px solid #fff;
  border-radius: 10px;
  padding: 10px;
}

.icon {
  margin-right: 10px;
}

input {
  border: none;
  outline: none;
  background: transparent;
  color: #fff;
  flex: 1;
}

::placeholder {
  color: #fff;
}

.options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.forgot-password {
  color: #fff;
  text-decoration: none;
}

.login-button {
  background-color: #4A6D69;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
}

.error {
  color: red;
  margin-top: 20px;
}
</style>