# Production Readiness Guide - Skillsverse

## 📋 Quick Start for Deployment

This guide provides everything you need to deploy Skillsverse to production.

### Files You Need to Know About

1. **DEPLOYMENT.md** - Comprehensive deployment instructions for different platforms
2. **DEPLOYMENT_CHECKLIST.md** - Detailed checklist to verify production readiness
3. **verify-deployment.sh** - Automated verification script (macOS/Linux)
4. **verify-deployment.bat** - Automated verification script (Windows)
5. **backend/.env.example** - Template for backend environment variables
6. **frontend/.env.example** - Template for frontend environment variables

## 🚀 Pre-Deployment Steps (5 minutes)

### 1. Create Environment Files

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your production values
nano .env  # or use your editor
```

Required variables:
- `MONGO_URI` - Production MongoDB connection string
- `JWT_SECRET` - Strong random string (min 32 chars)
- `STRIPE_SECRET_KEY` - Live Stripe secret key (starts with `sk_live_`)
- `STRIPE_PUBLISHABLE_KEY` - Live Stripe publishable key (starts with `pk_live_`)

**Frontend:**
```bash
cd frontend
cp .env.example .env.production.local
# Edit with your production API URL
nano .env.production.local
```

Set `VITE_API_URL` to your production backend URL (e.g., `https://api.yourdomain.com`)

### 2. Run Verification Script

**On macOS/Linux:**
```bash
chmod +x verify-deployment.sh
./verify-deployment.sh
```

**On Windows:**
```bash
verify-deployment.bat
```

This checks:
- ✓ All environment variables are set
- ✓ No hardcoded credentials in source
- ✓ Dependencies installed
- ✓ Build succeeds
- ✓ Security settings configured

### 3. Build Frontend

```bash
cd frontend
npm run build
# Creates optimized build in dist/
```

## 🔒 Security Checklist (Must Do!)

Before deploying, ensure:

- [ ] **JWT_SECRET** is a strong random string (not placeholder)
- [ ] Using **Stripe LIVE keys** (not test keys)
- [ ] **CORS_ORIGIN** restricted to your domain (not `*`)
- [ ] **.env files** are NOT committed to git
- [ ] **HTTPS/SSL** configured on all domains
- [ ] **Database credentials** stored only in .env
- [ ] No `console.log()` statements in production code
- [ ] Input validation on all API endpoints
- [ ] Error messages don't expose sensitive info

## 📊 Environment Variables Summary

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<strong-random-string>
STRIPE_SECRET_KEY=sk_live_<your-key>
STRIPE_PUBLISHABLE_KEY=pk_live_<your-key>
STRIPE_CONNECT_DESTINATION_ACCOUNT=acct_<your-account>
CORS_ORIGIN=https://yourdomain.com
ESCROW_HOLD_DAYS=1
ESCROW_CHECK_INTERVAL_MS=3600000
```

### Frontend (.env.production.local)
```
VITE_API_URL=https://api.yourdomain.com
```

## 🌐 Deployment Platform Options

### **Easiest: Vercel + Heroku**
- Frontend: Vercel (free tier available)
- Backend: Heroku (paid, ~$7/month)
- Database: MongoDB Atlas (free tier available)

See **DEPLOYMENT.md** for step-by-step instructions.

### **Full Control: AWS / DigitalOcean / Linode**
- More configuration needed
- Better performance
- Lower costs at scale

## 🧪 Testing Before Production

### 1. Test API Connection
```bash
curl https://api.yourdomain.com/
# Should return: {"message": "Skillsverse API is running smoothly."}
```

### 2. Test Auth Flow
1. Sign up as candidate/worker/admin
2. Verify email/phone if needed
3. Log in
4. Log out

### 3. Test Payment Flow
1. As candidate, create service request
2. As worker, accept request
3. Complete task
4. As candidate, process payment (use Stripe test cards)
5. Verify escrow release after hold period

### 4. Test Real-time Features
1. Create complaint
2. Check if admin receives notification
3. Reply to complaint
4. Verify candidate receives update

## 📈 Post-Deployment Monitoring

### Essential Monitoring
- [ ] Server uptime (UptimeRobot, Pingdom)
- [ ] Error logging (Sentry, LogRocket)
- [ ] Performance monitoring (New Relic, DataDog)
- [ ] Database monitoring (MongoDB Atlas dashboard)
- [ ] Payment processing (Stripe dashboard)

### Recommended Alerts
- Server down
- High error rate (>1%)
- Payment failures
- Database connection lost
- Disk space low
- Memory usage high

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check environment variables
echo $MONGO_URI
echo $JWT_SECRET

# Check logs
heroku logs --tail  # if using Heroku
pm2 logs            # if using PM2
```

### API connection errors
```bash
# Verify backend is running
curl https://api.yourdomain.com/

# Check CORS configuration
# Backend should have CORS_ORIGIN set to your frontend domain
```

### Frontend not loading
```bash
# Check build was successful
ls frontend/dist/  # should have files

# Clear browser cache
# Ctrl+Shift+Delete on most browsers
```

### Payment failures
1. Check Stripe dashboard for error details
2. Verify webhook endpoints are configured
3. Ensure STRIPE_SECRET_KEY is live key
4. Check MongoDB escrow collection

## 📞 Quick Support

For each issue, check in this order:
1. Review logs (most helpful)
2. Check environment variables are correct
3. Verify external services (MongoDB, Stripe) are accessible
4. Test connectivity with `curl`
5. Check firewall/security group rules

## 🎯 Next Steps After Deploy

1. **Monitor** for 24 hours for any issues
2. **Document** any configuration specific to your setup
3. **Set up backups** for database
4. **Configure monitoring** alerts
5. **Plan maintenance** window if needed
6. **Train team** on deployment process

## 📚 Detailed Documentation

For more details, see:
- **DEPLOYMENT.md** - Platform-specific instructions
- **DEPLOYMENT_CHECKLIST.md** - Complete pre-deployment checklist
- **backend/.env.example** - Backend variables documentation
- **frontend/.env.example** - Frontend variables documentation

## ⚠️ Common Mistakes to Avoid

❌ Using test Stripe keys in production  
❌ Committing .env files to git  
❌ Setting CORS to `*` in production  
❌ Not setting JWT_SECRET to strong value  
❌ Skipping HTTPS setup  
❌ Not backing up database  
❌ Not monitoring after deployment  
❌ Leaving console.log() in production code  

## ✅ Success Indicators

Your deployment is successful when:
- ✓ All verification checks pass
- ✓ Frontend loads without console errors
- ✓ API responds to requests
- ✓ Authentication works
- ✓ Payments process correctly
- ✓ Real-time features work
- ✓ No errors in monitoring dashboard
- ✓ Database is accessible and responsive

---

**Happy deploying! 🚀**

If you have any questions or issues, check the detailed documentation files or review your logs.
