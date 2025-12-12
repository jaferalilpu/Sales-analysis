# ULICA Deployment Checklist

Use this checklist to verify all systems are ready for production deployment.

## Pre-Deployment

### Environment Setup
- [ ] All environment variables configured (see `.env.example`)
- [ ] Database migrations run successfully
- [ ] SMTP credentials tested and working
- [ ] Payment gateway credentials tested (Razorpay/PhonePe)
- [ ] Shiprocket credentials tested
- [ ] JWT secrets generated (strong, random)
- [ ] Frontend URL configured correctly
- [ ] Backend URL configured correctly

### Code Quality
- [ ] `npm run type-check` passes (0 errors)
- [ ] `npm run build` succeeds for both frontend and backend
- [ ] `npm run lint` passes (warnings acceptable)
- [ ] All tests pass (`npm test`)
- [ ] No console.log statements in production code
- [ ] All TODO/FIXME comments addressed or documented

### Security
- [ ] All secrets stored in environment variables (not in code)
- [ ] HTTPS enabled in production
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Helmet security headers configured
- [ ] Cookies set to httpOnly, secure, sameSite
- [ ] SQL injection protection verified
- [ ] XSS protection verified

### Database
- [ ] Database backup created
- [ ] Migrations tested on staging
- [ ] Indexes created for performance
- [ ] Connection pooling configured
- [ ] Database credentials secure

## Deployment Steps

### Backend
- [ ] Build backend: `cd backend && npm run build`
- [ ] Verify `dist/` directory created
- [ ] Start backend: `npm start`
- [ ] Verify health endpoint: `GET /health`
- [ ] Verify API endpoints respond correctly
- [ ] Check logs for errors

### Frontend
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Verify `.next/` directory created
- [ ] Start frontend: `npm start`
- [ ] Verify homepage loads
- [ ] Test critical user flows

### Services
- [ ] Email service working (send test email)
- [ ] Payment gateways tested (test transaction)
- [ ] Shiprocket integration tested
- [ ] File uploads working
- [ ] Image optimization working

## Post-Deployment Verification

### Health Checks
- [ ] Run `scripts/production-health-check.sh`
- [ ] Backend health endpoint returns 200
- [ ] Frontend loads without errors
- [ ] Database connection stable
- [ ] All external APIs reachable

### Functional Testing
- [ ] User registration works
- [ ] User login works
- [ ] Product browsing works
- [ ] Add to cart works
- [ ] Checkout process works
- [ ] Payment processing works
- [ ] Order confirmation emails sent
- [ ] Admin panel accessible
- [ ] Admin CRUD operations work

### Performance
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] Images loading correctly
- [ ] No memory leaks detected

### Monitoring
- [ ] Error logging working
- [ ] Request logging working
- [ ] Performance monitoring active
- [ ] Alerts configured (if applicable)

## Rollback Plan

- [ ] Database backup available
- [ ] Previous version tagged in git
- [ ] Rollback script tested
- [ ] Rollback procedure documented

## Documentation

- [ ] README.md updated
- [ ] API documentation updated
- [ ] Deployment guide updated
- [ ] Environment variables documented

## Sign-Off

- [ ] Code review completed
- [ ] Security review completed
- [ ] Performance review completed
- [ ] Stakeholder approval received

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Verified By**: _______________

**Notes**:
_________________________________
_________________________________
_________________________________
