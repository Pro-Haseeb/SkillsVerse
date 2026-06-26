# Production Deployment Checklist

## Code Quality & Security

- [ ] No hardcoded credentials in code
- [ ] All sensitive data uses environment variables
- [ ] `.env` files are in `.gitignore` and NOT committed
- [ ] JWT secrets are strong (minimum 32 characters)
- [ ] CORS origin is configured correctly for production
- [ ] Error handling properly implemented
- [ ] No sensitive information in error messages
- [ ] Input validation on all endpoints
- [ ] SQL injection/NoSQL injection prevention (if applicable)
- [ ] HTTPS enforced in production
- [ ] Security headers configured

## Dependencies & Build

- [ ] All npm dependencies are up to date
- [ ] No security vulnerabilities in dependencies (`npm audit`)
- [ ] Production build tested locally (`npm run build`)
- [ ] Node.js version specified in package.json or .nvmrc
- [ ] npm/yarn lock file is committed
- [ ] Build completes without warnings
- [ ] Bundle size is acceptable

## Environment Configuration

### Backend

- [ ] MONGO_URI set to production database
- [ ] JWT_SECRET configured with strong random value
- [ ] STRIPE_SECRET_KEY set to live key (not test)
- [ ] STRIPE_PUBLISHABLE_KEY set to live key (not test)
- [ ] STRIPE_CONNECT_DESTINATION_ACCOUNT configured
- [ ] NODE_ENV set to 'production'
- [ ] PORT configured for production
- [ ] CORS_ORIGIN restricted to frontend domain
- [ ] ESCROW configuration tested
- [ ] All environment variables documented in .env.example

### Frontend

- [ ] VITE_API_URL points to production backend
- [ ] No console.log() calls left in production code
- [ ] Environment variable configured for build

## Database

- [ ] MongoDB cluster configured and secured
- [ ] IP whitelist includes production server
- [ ] Database authentication enabled
- [ ] Backups configured and tested
- [ ] Database replicas configured for high availability
- [ ] Connection pooling configured
- [ ] Indexes created for frequently queried fields

## Stripe Setup

- [ ] Switched from test to production mode
- [ ] Production API keys obtained
- [ ] Stripe Connect account created and verified
- [ ] Webhook endpoints configured
  - [ ] Payment success endpoint
  - [ ] Payment failure endpoint
  - [ ] Refund endpoint
- [ ] Webhook signing secret configured
- [ ] Test transactions processed successfully
- [ ] Worker payout configuration verified

## Server & Infrastructure

- [ ] Server has sufficient CPU/RAM/Storage
- [ ] Firewall rules allow only necessary ports
- [ ] SSH keys configured securely
- [ ] Automatic backups configured
- [ ] SSL/TLS certificate installed
- [ ] Certificate auto-renewal configured
- [ ] CDN configured (if needed)
- [ ] Load balancer configured (if needed)
- [ ] Database server separated from app server
- [ ] Monitoring and alerting configured

## API & Connectivity

- [ ] Backend API responds to requests
- [ ] Health check endpoint working (`GET /`)
- [ ] Database connection verified
- [ ] External services reachable (MongoDB, Stripe)
- [ ] DNS records configured correctly
- [ ] HTTPS working with valid certificate
- [ ] CORS headers correct for frontend domain
- [ ] WebSocket connections working

## Frontend Deployment

- [ ] Production build generated
- [ ] Source maps excluded from production build
- [ ] Static assets served with proper caching headers
- [ ] SPA routing configured correctly
- [ ] Environment variables loaded correctly
- [ ] API calls use correct base URL
- [ ] Frontend loads without console errors
- [ ] All pages and features tested

## Testing

- [ ] All critical user flows tested
- [ ] Authentication flow tested
- [ ] Payment flow tested (with test transactions)
- [ ] Escrow system tested
- [ ] Complaint system tested
- [ ] Real-time notifications tested
- [ ] File uploads tested
- [ ] Error scenarios handled gracefully
- [ ] Responsive design tested on mobile
- [ ] Browser compatibility verified

## Monitoring & Logging

- [ ] Server uptime monitoring configured
- [ ] Error logging configured
- [ ] Performance monitoring configured
- [ ] Database monitoring configured
- [ ] Payment processing monitoring configured
- [ ] Alert notifications configured
- [ ] Log aggregation configured
- [ ] Log retention policy set
- [ ] Analytics tracking configured

## Documentation

- [ ] Deployment instructions documented
- [ ] Environment variables documented
- [ ] API documentation accessible
- [ ] Database schema documented
- [ ] Emergency procedures documented
- [ ] Rollback procedures documented
- [ ] Team trained on deployment process

## Final Checks

- [ ] Staging environment tests completed successfully
- [ ] Performance testing completed
- [ ] Load testing completed (if applicable)
- [ ] Security testing completed
- [ ] Backup and recovery tested
- [ ] Disaster recovery plan in place
- [ ] Team notified of deployment schedule
- [ ] Rollback plan prepared
- [ ] Post-deployment monitoring ready

## Deployment Sign-Off

- [ ] Project Lead: _____________ Date: _______
- [ ] DevOps/Infrastructure: _____________ Date: _______
- [ ] QA/Testing: _____________ Date: _______

## Post-Deployment

- [ ] Monitor server logs for errors
- [ ] Monitor payment processing
- [ ] Monitor user authentication
- [ ] Check API response times
- [ ] Verify database performance
- [ ] Monitor error rates
- [ ] Gather user feedback
- [ ] Plan for future improvements
