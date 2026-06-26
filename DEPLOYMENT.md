# Skillsverse Deployment Guide

This guide provides step-by-step instructions for deploying the Skillsverse application to production environments.

## Current Production Setup

- **Backend**: https://skillsverse-8x82.onrender.com (Render)
- **Database**: MongoDB Atlas (cluster0.eg6vwrs.mongodb.net)
- **Frontend**: To be deployed

## Pre-Deployment Checklist

### 1. Environment Variables Configuration

Before deploying, ensure all required environment variables are set correctly:

#### Backend Configuration
Create a `.env` file in the `backend/` directory based on `.env.example`:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillsverse?appName=Cluster

# JWT Configuration (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_CONNECT_DESTINATION_ACCOUNT=acct_your_connect_account

# Escrow Configuration
ESCROW_HOLD_DAYS=1
ESCROW_CHECK_INTERVAL_MS=3600000

# CORS Configuration (restrict to your domain in production)
CORS_ORIGIN=https://yourdomain.com
```

#### Frontend Configuration
Create a `.env.production.local` file in the `frontend/` directory:

```bash
# API URL pointing to your production backend
VITE_API_URL=https://skillsverse-8x82.onrender.com
```

### 2. Security Recommendations

- **Never** commit `.env` files to version control (they are in `.gitignore`)
- Use strong, randomly generated JWT secrets (minimum 32 characters)
- Use production Stripe keys (not test keys)
- Restrict CORS origin to your actual domain
- Enable HTTPS in production (SSL/TLS certificate)
- Keep Node.js and npm dependencies updated
- Regularly audit dependencies for security vulnerabilities

### 3. Database Setup

- Ensure MongoDB Atlas cluster is configured correctly
- Create database backups before deployment
- Set up proper authentication and IP whitelisting
- Monitor database performance and storage usage

### 4. Stripe Setup

- Upgrade from test mode to production mode
- Replace test keys with live keys
- Set up Stripe Connect for worker payouts
- Configure webhook endpoints for payment events

## Deployment Steps

### Backend Deployment (Node.js)

#### Option A: Using Render (Current Setup)

1. **Prepare Backend**
   ```bash
   cd backend
   npm install
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up and create a new Web Service

3. **Connect GitHub Repository**
   - Connect your GitHub repository to Render
   - Select the `backend` folder as root directory
   - Set build command: `npm install`
   - Set start command: `node server.js`

4. **Set Environment Variables in Render Dashboard**
   - Go to your Render service → Settings → Environment Variables
   - Add the following variables:
     ```
     MONGO_URI=mongodb+srv://Haseeb:haseeb123@cluster0.eg6vwrs.mongodb.net/skillverse?appName=Cluster0
     JWT_SECRET=skillsverse_secret_key_12345
     STRIPE_SECRET_KEY=sk_test_your_secret_key_here
     STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
     STRIPE_CONNECT_DESTINATION_ACCOUNT=acct_xxxxxxxx
     ESCROW_HOLD_DAYS=1
     ESCROW_CHECK_INTERVAL_MS=3600000
     CORS_ORIGIN=*
     NODE_ENV=production
     PORT=5000
     ```

5. **Deploy**
   - Push changes to GitHub
   - Render will automatically deploy
   - Monitor deployment in Render Dashboard

6. **Important Note for File Uploads**
   - Render's filesystem is ephemeral (files are lost on redeploy)
   - Current implementation uses local `uploads/` folder
   - **Recommendation**: Migrate to cloud storage (AWS S3, Cloudinary) for production file persistence

#### Option B: Using Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGO_URI="your-production-mongodb-uri"
   heroku config:set JWT_SECRET="your-strong-jwt-secret"
   heroku config:set STRIPE_SECRET_KEY="sk_live_..."
   heroku config:set STRIPE_PUBLISHABLE_KEY="pk_live_..."
   heroku config:set STRIPE_CONNECT_DESTINATION_ACCOUNT="acct_..."
   heroku config:set CORS_ORIGIN="https://yourdomain.com"
   heroku config:set NODE_ENV="production"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   heroku logs --tail
   ```

#### Option B: Using AWS EC2/ECS

1. **Prepare Backend**
   ```bash
   cd backend
   npm install
   npm test  # if tests exist
   ```

2. **Deploy with PM2 (for EC2)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "skillsverse-backend"
   pm2 save
   pm2 startup
   ```

3. **Set Environment Variables**
   ```bash
   export MONGO_URI="your-production-mongodb-uri"
   export JWT_SECRET="your-strong-jwt-secret"
   export STRIPE_SECRET_KEY="sk_live_..."
   # ... other variables
   ```

#### Option C: Using DigitalOcean/Linode

1. **SSH into your server**
   ```bash
   ssh root@your_server_ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone and Setup Backend**
   ```bash
   git clone your-repo-url
   cd backend
   npm install
   ```

4. **Create systemd Service File**
   Create `/etc/systemd/system/skillsverse.service`:
   ```ini
   [Unit]
   Description=Skillsverse Backend
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/backend
   ExecStart=/usr/bin/node server.js
   Restart=always
   Environment="MONGO_URI=your-mongo-uri"
   Environment="JWT_SECRET=your-jwt-secret"
   # ... other environment variables

   [Install]
   WantedBy=multi-user.target
   ```

5. **Start Service**
   ```bash
   sudo systemctl enable skillsverse
   sudo systemctl start skillsverse
   ```

### Frontend Deployment (React + Vite)

#### Option A: Using Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `VITE_API_URL=https://skillsverse-8x82.onrender.com`

4. **Custom Domain** (Optional)
   - Add custom domain in Vercel Dashboard
   - Update CORS_ORIGIN in backend to match your domain

#### Option B: Using Render (Same as Backend)

1. **Create Another Render Service**
   - Go to Render Dashboard
   - Create new Web Service for frontend
   - Connect same GitHub repository
   - Set root directory to `frontend`
   - Set build command: `npm run build`
   - Set start command: `npm run preview` or use static site deployment

2. **Configure as Static Site**
   - Render can serve the `dist/` folder as a static site
   - No need for a Node.js server for frontend

3. **Set Environment Variables**
   - Add `VITE_API_URL=https://skillsverse-8x82.onrender.com`

#### Option C: Using Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Configure Environment Variables**
   - Netlify Dashboard → Site Settings → Build & Deploy → Environment
   - Add `VITE_API_URL=https://skillsverse-8x82.onrender.com`

#### Option D: Using AWS S3 + CloudFront

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Invalidate CloudFront Cache**
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

#### Option E: Using Traditional Web Server (Nginx)

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Configure Nginx**
   Create `/etc/nginx/sites-available/skillsverse`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       # Redirect HTTP to HTTPS
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name yourdomain.com www.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

       root /var/www/frontend/dist;
       index index.html;

       # SPA routing
       location / {
           try_files $uri $uri/ /index.html;
       }

       # API proxy
       location /api {
           proxy_pass https://api.yourdomain.com;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/skillsverse /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Post-Deployment Verification

### 1. Backend Health Check
```bash
curl https://skillsverse-8x82.onrender.com/
# Should return: {"message": "Skillsverse API is running smoothly."}
```

### 2. Database Connection
- Monitor MongoDB connection status
- Verify collections are created
- Check logs for connection errors

### 3. Stripe Integration
- Test payment flow with test data
- Verify webhooks are configured
- Check Stripe Dashboard for payment records

### 4. Frontend Accessibility
- Visit your frontend domain
- Test all major user flows
- Check browser console for errors
- Verify API calls are reaching backend

### 5. SSL/TLS Certificate
- Verify HTTPS is working
- Check certificate expiration
- Set up auto-renewal (Let's Encrypt)

### 6. Monitoring and Logging

Setup monitoring for:
- Backend server uptime
- Database connection status
- API response times
- Error logs
- Payment failures
- User authentication issues

Popular services:
- **Uptime**: Pingdom, UptimeRobot, Datadog
- **Logs**: LogRocket, Sentry, ELK Stack
- **Performance**: New Relic, DataDog, CloudWatch
- **Errors**: Sentry, Rollbar, LogRocket

## Troubleshooting

### Backend Won't Start
1. Check environment variables: `echo $MONGO_URI`
2. Verify MongoDB connection
3. Check Node.js version compatibility
4. Review logs: `pm2 logs` or `heroku logs --tail`

### API Connection Errors
1. Verify backend is running: `curl http://localhost:5000`
2. Check CORS configuration matches frontend domain
3. Verify firewall rules allow API traffic
4. Check network connectivity

### Frontend Not Loading
1. Verify build completed: `ls dist/`
2. Check web server configuration (Nginx/Apache)
3. Verify static asset paths
4. Check browser cache (clear if needed)

### Payment Processing Issues
1. Verify Stripe API keys are correct
2. Check Stripe webhook endpoints
3. Review Stripe Dashboard for error details
4. Check MongoDB escrow collection

## Maintenance

### Regular Tasks
- Monitor server disk space and memory
- Update dependencies monthly
- Review and archive logs
- Backup database weekly
- Monitor Stripe account for issues
- Check SSL certificate expiration

### Emergency Procedures
- **Database Backup**: `mongodump --uri "mongodb+srv://..."`
- **Restore Database**: `mongorestore --uri "mongodb+srv://..." ./dump`
- **Rollback Deployment**: Use git to rollback to previous commit
- **Emergency Maintenance**: Display maintenance page while fixing issues

## Support

For deployment issues or questions:
1. Check logs for error messages
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Test connectivity to external services (MongoDB, Stripe)
5. Consult documentation for your hosting platform
