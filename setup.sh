#!/bin/bash

# Create React + TypeScript + Vite project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install additional dependencies
npm install react-router-dom axios formik yup @tailwindcss/forms
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind CSS
npx tailwindcss init -p

echo "Project setup completed!"
