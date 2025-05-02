# 📅 appointment-calendar

Aplicación web desarrollada en **Angular 18** para la **gestión de citas**. Permite organizar, crear, modificar y eliminar citas asociadas a clientes y servicios. Consume una API desarrollada en Laravel que gestiona toda la lógica de backend.

## 🔗 Repositorio de la API

Este frontend se comunica con la API Laravel disponible en:  
➡️ [appointments-api](https://github.com/PedroMiguelSV/Appointments-api-laravel.git)

---

## 🚀 Tecnologías utilizadas

- **Angular 18 (Standalone Components)**
- **Bootstrap 5** y **Bootstrap Icons**
- **FullCalendar** para la gestión del calendario
- **JWT (JSON Web Tokens)** para autenticación
- **RxJS** para programación reactiva
- **Laravel 11** como backend API (proyecto separado)

---

## 🧩 Funcionalidades principales

- 🔐 Autenticación con login, registro, logout y refresh de token
- 👥 Gestión de clientes (crear, editar, eliminar, buscar)
- 💈 Gestión de servicios (crear, editar, eliminar)
- 📆 Gestión de citas en un calendario interactivo:
  - Modal de cita con formulario dinámico
  - Cálculo automático de duración según servicios seleccionados
  - Búsqueda de clientes en tiempo real
- 👤 Administración de usuarios registrados
- ⚙️ Validaciones tanto en frontend como desde el backend
- 🌐 Interfaz completamente en español

---

## 📦 Instalación del proyecto

1. Clona este repositorio:
   ```bash  
   git clone https://github.com/PedroMiguelSV/appointment-calendar.git  
   cd appointment-calendar  

2. Instala las dependencias:
   ```bash  
   npm install  

3.  Ejecuta la aplicación en desarrollo:
    ```bash
    ng serve

4. Abre tu navegador en:  
   ```bash  
   http://localhost:4200

⚠️ Importante: asegúrate de tener la API Laravel (appointments-api) en funcionamiento en http://localhost:8000 o cambia la URL en los servicios Angular si usas otro puerto o dominio.

---

## ⚙️ Scripts disponibles
    npm start —> 'Ejecuta la app en desarrollo'
    npm run build —> 'Compila la aplicación para producción'

---

## 👨‍💻 Autor
Desarrollado por Pedro Miguel  
🔗 GitHub: @PedroMiguelSV  
🔗 LinkedIn: Pedro Miguel - LinkedIn

---

## 📃 Licencia
Este proyecto está bajo la licencia MIT.  
