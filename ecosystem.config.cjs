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
  ],
};
