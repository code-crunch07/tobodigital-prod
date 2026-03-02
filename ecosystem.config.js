module.exports = {
  apps: [
    {
      name: 'tobo-backend',
      script: 'dist/server.js',
      cwd: '/home/cloudpanel/htdocs/tobo-backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/home/cloudpanel/htdocs/tobo-backend/logs/backend-err.log',
      out_file: '/home/cloudpanel/htdocs/tobo-backend/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    },
    {
      name: 'tobo-dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/home/cloudpanel/htdocs/tobo-backend/dashboard',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/cloudpanel/htdocs/tobo-backend/logs/dashboard-err.log',
      out_file: '/home/cloudpanel/htdocs/tobo-backend/logs/dashboard-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    },
    {
      name: 'tobo-client',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: '/home/cloudpanel/htdocs/tobo-backend/client',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        // Path to uploads so proxy-image can serve from disk (adjust for your server)
        CLIENT_UPLOADS_DIR: '/home/tobodigital/htdocs/tobodigital.com/tobo-uploads/public'
      },
      error_file: '/home/cloudpanel/htdocs/tobo-backend/logs/client-err.log',
      out_file: '/home/cloudpanel/htdocs/tobo-backend/logs/client-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    }
  ]
};








