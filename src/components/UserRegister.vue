<template>
  <div class="register-container">
    <img src="@/assets/Fagia.png" alt="Fagia Logo" class="logo" />
    <h2>Registro de usuario</h2>
    <form @submit.prevent="register">
      <div class="role-selection">
        <label>¿Qué tipo de usuario eres?</label>
        <div class="role-options">
          <button type="button" 
                  :class="{ active: userType === 'donor' }" 
                  @click="userType = 'donor'">
            Donador
          </button>
          <button type="button" 
                  :class="{ active: userType === 'institution' }" 
                  @click="userType = 'institution'">
            Institución
          </button>
        </div>
      </div>

      <!-- Common fields for all users -->
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

      <!-- Donor specific fields -->
      <div v-if="userType === 'donor'" class="donor-fields">
        <div class="input-group">
          <label for="fullName">
            <i class="icon">👤</i>
            <input type="text" id="fullName" v-model="donor.fullName" placeholder="Nombre completo" required />
          </label>
        </div>
        <div class="input-group">
          <label for="phone">
            <i class="icon">📱</i>
            <input type="tel" id="phone" v-model="donor.phone" placeholder="Teléfono" required />
          </label>
        </div>
        <div class="input-group">
          <label for="businessName">
            <i class="icon">🏢</i>
            <input type="text" id="businessName" v-model="donor.businessName" placeholder="Nombre del restaurante/empresa (opcional)" />
          </label>
        </div>
      </div>

      <!-- Institution specific fields -->
      <div v-if="userType === 'institution'" class="institution-fields">
        <div class="input-group">
          <label for="legalName">
            <i class="icon">🏛</i>
            <input type="text" id="legalName" v-model="institution.legalName" placeholder="Nombre legal" required />
          </label>
        </div>
        <div class="input-group">
          <label for="taxId">
            <i class="icon">📄</i>
            <input type="text" id="taxId" v-model="institution.taxId" placeholder="NIF/Identificación fiscal" required />
          </label>
        </div>
        <div class="input-group">
          <label for="institutionPhone">
            <i class="icon">📱</i>
            <input type="tel" id="institutionPhone" v-model="institution.phone" placeholder="Teléfono" required />
          </label>
        </div>
        <div class="input-group">
          <label for="website">
            <i class="icon">🌐</i>
            <input type="url" id="website" v-model="institution.website" placeholder="Sitio web (opcional)" />
          </label>
        </div>
        <div class="input-group">
          <label for="foundationDate">
            <i class="icon">📅</i>
            <input type="date" id="foundationDate" v-model="institution.foundationDate" placeholder="Fecha de constitución" required />
          </label>
        </div>
      </div>

      <div class="options">
        <label>
          <input type="checkbox" v-model="termsAccepted" required /> Acepto los términos y condiciones
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
      userType: 'donor', // 'donor' or 'institution'
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
      error: "",
      
      // Donor specific data
      donor: {
        fullName: "",
        phone: "",
        businessName: ""
      },
      
      // Institution specific data
      institution: {
        legalName: "",
        taxId: "",
        phone: "",
        website: "",
        foundationDate: ""
      }
    };
  },
  methods: {
    register() {
      // Validation
      if (this.password !== this.confirmPassword) {
        this.error = "Las contraseñas no coinciden";
        return;
      }
      
      if (!this.termsAccepted) {
        this.error = "Debes aceptar los términos y condiciones";
        return;
      }
      
      // Prepare registration data based on user type
      const registrationData = {
        email: this.email,
        password: this.password,
        userType: this.userType
      };
      
      if (this.userType === 'donor') {
        registrationData.donorData = {
          ...this.donor,
          businessName: this.donor.businessName || "No aplica"
        };
      } else {
        registrationData.institutionData = {
          ...this.institution
        };
      }
      
      // Emit event with all registration data
      this.$emit("register-success", registrationData);
      this.error = "";
    }
  }
};
</script>

<style scoped>
.register-container {
  max-width: 500px;
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

.role-selection {
  margin-bottom: 20px;
}

.role-options {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.role-options button {
  padding: 8px 16px;
  border: 1px solid #4A6D69;
  background: transparent;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
}

.role-options button.active {
  background-color: #4A6D69;
  color: white;
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
  color: #ccc;
}

.options {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.options label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.register-button {
  background-color: #4A6D69;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  transition: background-color 0.3s;
}

.register-button:hover {
  background-color: #3a5a57;
}

.error {
  color: #ff6b6b;
  margin-top: 20px;
}

.login-link {
  margin-top: 20px;
}

.login {
  color: #4A6D69;
  text-decoration: none;
  font-weight: bold;
}

.login:hover {
  text-decoration: underline;
}

.donor-fields,
.institution-fields {
  margin: 20px 0;
  border-top: 1px solid #444;
  padding-top: 20px;
}
</style>