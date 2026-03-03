# Security Checklist

This checklist ensures ClaimShield DV follows security best practices.

## Pre-Deployment Security Checklist

### Environment Variables

- [ ] All sensitive keys are server-side only (no `NEXT_PUBLIC_` prefix)
- [ ] `.env.local` is in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] Environment variables are validated on startup
- [ ] Different keys for development, staging, and production
- [ ] API keys are rotated regularly (quarterly)

### Authentication & Authorization

- [ ] All protected routes require authentication
- [ ] User ownership is validated on all queries
- [ ] Role-based access control is enforced
- [ ] Session tokens are secure and httpOnly
- [ ] Password requirements meet standards (handled by Clerk)
- [ ] Multi-factor authentication is available (Clerk)
- [ ] Account lockout after failed attempts (Clerk)

### API Security

- [ ] All API routes validate authentication
- [ ] Input validation on all endpoints
- [ ] Rate limiting is implemented
- [ ] CORS is properly configured
- [ ] Webhook signatures are validated
- [ ] SQL injection prevention (Drizzle ORM)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection (Next.js built-in)

### Data Security

- [ ] Database connections use SSL
- [ ] Sensitive data is encrypted at rest
- [ ] PII is handled according to regulations
- [ ] File uploads are validated (type, size)
- [ ] Files are stored with private access
- [ ] Signed URLs expire appropriately
- [ ] User data is isolated (no cross-user access)

### Network Security

- [ ] HTTPS is enforced
- [ ] Security headers are set (CSP, X-Frame-Options, etc.)
- [ ] TLS 1.2+ is required
- [ ] Certificate is valid and not expired
- [ ] DNS is properly configured
- [ ] DDoS protection is enabled (Vercel)

### Third-Party Services

- [ ] Clerk webhook signature validation
- [ ] Stripe webhook signature validation
- [ ] API keys are restricted by IP (where possible)
- [ ] Service accounts have minimum permissions
- [ ] Third-party dependencies are up to date
- [ ] Vulnerability scanning is enabled

### Code Security

- [ ] No `any` types in TypeScript
- [ ] ESLint security rules are enabled
- [ ] Dependencies are audited (`npm audit`)
- [ ] No console.log with sensitive data
- [ ] Error messages don't expose internals
- [ ] Stack traces are hidden in production

### File Upload Security

- [ ] File type validation (whitelist)
- [ ] File size limits enforced (25MB)
- [ ] File content validation
- [ ] Malware scanning (recommended)
- [ ] Path traversal prevention
- [ ] Filename sanitization

### Logging & Monitoring

- [ ] Security events are logged
- [ ] Error tracking is configured (Sentry)
- [ ] Failed login attempts are monitored
- [ ] Unusual activity triggers alerts
- [ ] Logs don't contain sensitive data
- [ ] Log retention policy is defined

## Runtime Security Checks

### Authentication Tests

```bash
# Test unauthenticated access is blocked
curl -X GET https://your-domain.com/api/appraisals
# Expected: 401 Unauthorized

# Test invalid token is rejected
curl -X GET https://your-domain.com/api/appraisals \
  -H "Authorization: Bearer invalid-token"
# Expected: 401 Unauthorized
```

### Authorization Tests

```bash
# Test user cannot access other user's data
# 1. Create appraisal as User A
# 2. Try to access as User B
# Expected: 403 Forbidden
```

### Input Validation Tests

```bash
# Test SQL injection prevention
curl -X POST https://your-domain.com/api/appraisals \
  -H "Content-Type: application/json" \
  -d '{"vin": "'; DROP TABLE users; --"}'
# Expected: 400 Bad Request (validation error)

# Test XSS prevention
curl -X POST https://your-domain.com/api/appraisals \
  -H "Content-Type: application/json" \
  -d '{"ownerName": "<script>alert(1)</script>"}'
# Expected: Input sanitized or rejected
```

### File Upload Tests

```bash
# Test file type validation
curl -X POST https://your-domain.com/api/documents/upload \
  -F "file=@malicious.exe"
# Expected: 400 Bad Request (invalid file type)

# Test file size limit
curl -X POST https://your-domain.com/api/documents/upload \
  -F "file=@large-file.pdf"
# Expected: 400 Bad Request (file too large)
```

### Rate Limiting Tests

```bash
# Test rate limiting
for i in {1..100}; do
  curl -X GET https://your-domain.com/api/appraisals
done
# Expected: 429 Too Many Requests after threshold
```

## Security Headers Verification

Check security headers are present:

```bash
curl -I https://your-domain.com
```

Expected headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: ...
Strict-Transport-Security: max-age=31536000
```

## Vulnerability Scanning

### Dependency Audit

```bash
# Check for known vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

### Code Scanning

```bash
# Run ESLint with security rules
npm run lint

# TypeScript strict mode check
npm run type-check
```

### Penetration Testing

Recommended tools:
- **OWASP ZAP**: Web application security scanner
- **Burp Suite**: Security testing platform
- **SQLMap**: SQL injection testing
- **XSStrike**: XSS vulnerability scanner

## Incident Response

### Security Incident Procedure

1. **Detect**: Monitor logs and alerts
2. **Contain**: Isolate affected systems
3. **Investigate**: Determine scope and impact
4. **Remediate**: Fix vulnerability
5. **Recover**: Restore normal operations
6. **Review**: Post-incident analysis

### Emergency Contacts

- Security Lead: [email]
- DevOps: [email]
- Legal: [email]
- On-call: [phone]

### Breach Notification

If user data is compromised:
1. Notify affected users within 72 hours
2. Report to relevant authorities (GDPR, etc.)
3. Document incident details
4. Implement preventive measures

## Compliance

### GDPR Compliance

- [ ] Privacy policy is published
- [ ] Cookie consent is implemented
- [ ] User data can be exported
- [ ] User data can be deleted
- [ ] Data processing agreement with vendors
- [ ] Data breach notification procedure

### PCI DSS Compliance

- [ ] No credit card data is stored (Stripe handles)
- [ ] PCI-compliant payment processor (Stripe)
- [ ] Secure transmission of payment data

### CCPA Compliance

- [ ] Privacy policy includes CCPA disclosures
- [ ] Users can request data deletion
- [ ] Users can opt-out of data sale
- [ ] Privacy rights are honored

## Regular Security Tasks

### Daily

- [ ] Monitor error logs
- [ ] Check failed login attempts
- [ ] Review security alerts

### Weekly

- [ ] Review access logs
- [ ] Check for unusual activity
- [ ] Verify backups are working

### Monthly

- [ ] Run dependency audit
- [ ] Review user permissions
- [ ] Update dependencies
- [ ] Test backup restoration

### Quarterly

- [ ] Rotate API keys
- [ ] Review security policies
- [ ] Conduct security training
- [ ] Penetration testing

### Annually

- [ ] Security audit
- [ ] Compliance review
- [ ] Disaster recovery test
- [ ] Update security documentation

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Vercel Security](https://vercel.com/docs/security)
- [Clerk Security](https://clerk.com/docs/security)
- [Stripe Security](https://stripe.com/docs/security)

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Email security@claimshield-dv.com
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours.

## Security Training

All team members should complete:

- [ ] OWASP Top 10 training
- [ ] Secure coding practices
- [ ] Data privacy training
- [ ] Incident response procedures
- [ ] Social engineering awareness

## Conclusion

Security is an ongoing process. This checklist should be reviewed and updated regularly as new threats emerge and best practices evolve.

Last updated: [Date]
Next review: [Date + 3 months]
