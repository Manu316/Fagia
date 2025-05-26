<template>
    <div class="dashboard-donator">
      <h2>Panel del Donador</h2>
      <p>Bienvenido, {{ authStore.user?.name || authStore.user?.email || 'Donador' }}!</p>
  
      <div class="dashboard-actions">
        <router-link to="/donator/aliments" class="action-link">Gestionar Mis Alimentos</router-link>
        <router-link to="/donations" class="action-link">Ver Mis Donaciones Realizadas</router-link>
      </div>
  
      <div class="dashboard-summary">
        <h3>Resumen Rápido</h3>
        <p>Aquí puedes ver un resumen de tu actividad.</p>
        </div>
  
      </div>
  </template>
  
  <script setup>
  import { useAuthStore } from '@/stores/authStore'; 

  
  const authStore = useAuthStore();
 
  </script>
  
  <style scoped>
  .dashboard-donator {
    max-width: 900px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  h2 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 15px;
  }
  
  .dashboard-donator > p {
    text-align: center;
    font-size: 1.1em;
    color: #34495e; 
    margin-bottom: 25px;
  }
  
  .dashboard-actions {
    display: flex;
    justify-content: center;
    gap: 15px; 
    margin-bottom: 30px;
    flex-wrap: wrap;
  }
  
  .action-link {
    display: inline-block;
    padding: 12px 25px;
    background-color: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-size: 1em;
    transition: background-color 0.3s ease;
    text-align: center;
  }
  
  .action-link:hover {
    background-color: #2980b9;
  }
  
  .dashboard-summary {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 6px;
    border: 1px solid #ecf0f1;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }
  
  .dashboard-summary h3 {
    color: #34495e;
    margin-top: 0;
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
  
  .dashboard-summary p {
    color: #555;
    line-height: 1.6;
  }
  </style>