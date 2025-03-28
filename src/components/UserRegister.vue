<template>
  <div class="register-container">
    <img src="@/assets/Fagia.png" alt="Fagia Logo" class="logo" />
    <h2>Registro de usuario</h2>
    <form @submit.prevent="register">
      <div class="input-group">
        <label for="username">
          <i class="icon">👤</i>
          <input type="text" id="username" v-model="username" placeholder="Usuario" required />
        </label>
      </div>
      <div class="input-group">
        <label for="email">
          <i class="icon">📧</i>
          <input type="email" id="email" v-model="email" placeholder="Correo electrónico" required />
        </label>
      </div>
      <div class="input-group">
        <label for="password">
          <i class="icon">🔒</i>
          <input type="password" id="password" v-model="password" placeholder="Contraseña" required />
        </label>
      </div>
      <div class="input-group">
        <label for="confirmPassword">
          <i class="icon">🔑</i>
          <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="Confirmar contraseña" required />
        </label>
      </div>
      <div class="options">
        <label>
          <input type="checkbox" v-model="termsAccepted" /> Acepto los términos y condiciones
        </label>
      </div>
      <button type="submit" class="register-button">Registrarse</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
    <p class="login-link">¿Ya tienes cuenta? <a href="#" @click="$emit('show-login')" class="login">Iniciar sesión</a></p>
  </div>
</template>

<script>
export default {
  name: "UserRegister",
  data() {
    return {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
      error: "",
    };
  },
  methods: {
    register() {
      if (this.password !== this.confirmPassword) {
        this.error = "Las contraseñas no coinciden";
      } else if (!this.termsAccepted) {
        this.error = "Debes aceptar los términos y condiciones";
      } else {
        // Aquí podrías agregar lógica para registrar al usuario (por ejemplo, llamar a una API)
        this.$emit("register-success", this.username);
        this.error = "";
      }
    },
  },
};
</script>

<style scoped>
.register-container {
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

.register-button {
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

.login-link {
  margin-top: 20px;
}

.login {
  color: #fff;
  text-decoration: none;
}
</style>
