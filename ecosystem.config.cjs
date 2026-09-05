module.exports = {
  apps: [
    {
      name: "sakilhub-storefront",
      script: ".next/standalone/server.js",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      max_memory_restart: "600M",
      autorestart: true,
      watch: false,
    },
    {
      name: "sakilhub-backend",
      script: "npm",
      args: "run start",
      cwd: "./backend/apps/backend",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 9000,
      },
      max_memory_restart: "700M",
      autorestart: true,
      watch: false,
    },
  ],
};
