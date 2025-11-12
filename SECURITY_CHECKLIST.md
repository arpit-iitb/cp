# 🔐 Security Checklist - CodePaathshala

**Comprehensive security verification for production deployment**

## 🚨 CRITICAL SECURITY FIXES REQUIRED

### ❌ Current Security Issues (MUST FIX BEFORE PRODUCTION)

| Issue | Severity | Current State | Fix Required |
|-------|----------|---------------|--------------|
| No SSL/TLS encryption | **CRITICAL** | ❌ HTTP only | ✅ Configure HTTPS with Let's Encrypt |
| CORS wide open | **CRITICAL** | ❌ `CORS_ORIGIN_ALLOW_ALL=True` | ✅ Whitelist specific domains only |
| JWT token lifetime too long | **HIGH** | ❌ 30 days | ✅ Reduce to 1 hour (access) / 7 days (refresh) |
| Missing database indexes | **HIGH** | ❌ No indexes on frequently queried fields | ✅ Add indexes to `test_id`, `email`, foreign keys |
| No rate limiting | **HIGH** | ❌ Vulnerable to DDoS | ✅ Configure Nginx rate limits |
| Debug mode enabled | **HIGH** | ❌ `DEBUG=True` in example | ✅ Set `DEBUG=False` in production |
| Weak SECRET_KEY default | **HIGH** | ❌ `'replace-me'` | ✅ Generate 50-char random string |
| No security headers | **MEDIUM** | ❌ Missing HSTS, CSP, etc. | ✅ Add via Nginx config |
| Database exposed | **MEDIUM** | ❌ No connection encryption | ✅ Use SSL connections |
| N+1 query problems | **MEDIUM** | ❌ Multiple views | ✅ Add `select_related()`/`prefetch_related()` |

---

## 📋 Pre-Deployment Security Checklist

### 1. Environment & Configuration

#### Django Settings
- [ ] **`DEBUG = False`** in production
- [ ] **`SECRET_KEY`** is unique, 50+ characters, never committed to Git
- [ ] **`ALLOWED_HOSTS`** configured with actual domain(s) only
- [ ] **`CORS_ORIGIN_ALLOW_ALL = False`**
- [ ] **`CORS_ALLOWED_ORIGINS`** contains only your frontend domain(s)
- [ ] **`CSRF_TRUSTED_ORIGINS`** contains only your domain(s)
- [ ] **`SECURE_SSL_REDIRECT = True`**
- [ ] **`SESSION_COOKIE_SECURE = True`**
- [ ] **`CSRF_COOKIE_SECURE = True`**
- [ ] **`SECURE_HSTS_SECONDS`** set to at least 31536000 (1 year)
- [ ] **`X_FRAME_OPTIONS = 'DENY'`**

#### Environment Variables (.env.production)
- [ ] All secrets different from `.env.example` defaults
- [ ] `.env.production` added to `.gitignore`
- [ ] `.env.production` has restricted file permissions (600)
  ```bash
  chmod 600 .env.production
  ```
- [ ] Database password is 32+ characters, random
- [ ] Redis password is 32+ characters, random
- [ ] Email credentials are valid and tested

#### JWT Token Configuration
- [ ] Access token lifetime ≤ 60 minutes
- [ ] Refresh token lifetime ≤ 7 days
- [ ] Token rotation enabled
- [ ] Blacklist enabled after rotation

### 2. SSL/TLS Configuration

- [ ] Valid SSL certificate installed (Let's Encrypt or commercial)
- [ ] Certificate covers all required domains (www, api, etc.)
- [ ] HTTP to HTTPS redirect working
- [ ] HSTS header enabled
- [ ] SSL grade A or higher on [SSL Labs](https://www.ssllabs.com/ssltest/)
- [ ] TLS 1.2 minimum, TLS 1.3 preferred
- [ ] Strong cipher suites configured
- [ ] OCSP stapling enabled
- [ ] Certificate auto-renewal configured

**Test SSL:**
```bash
# Check certificate expiry
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates

# Test SSL configuration
curl -I https://your-domain.com
```

### 3. Database Security

#### PostgreSQL
- [ ] Default `postgres` user password changed
- [ ] Application database user has limited privileges (not superuser)
- [ ] Database not accessible from internet (no public IP binding)
- [ ] PostgreSQL listens only on Docker network
- [ ] Connection pooling configured (`CONN_MAX_AGE`)
- [ ] Query timeouts configured
- [ ] SSL/TLS connection encryption enabled (optional but recommended)
- [ ] Automated daily backups configured
- [ ] Backup restoration tested at least once

**Database Security Commands:**
```sql
-- Verify user privileges
\du

-- Check database connections
SELECT * FROM pg_stat_activity;

-- Revoke public schema permissions
REVOKE ALL ON SCHEMA public FROM public;
GRANT ALL ON SCHEMA public TO cp_prod_user;
```

#### Database Backups
- [ ] Automated daily backups via cron
- [ ] Backups stored in secure location
- [ ] Backup retention policy (30 days recommended)
- [ ] Backup restoration tested successfully
- [ ] Off-site backup copy (S3, Google Cloud Storage)

### 4. Nginx Configuration

- [ ] Rate limiting configured (`limit_req_zone`)
- [ ] Connection limits configured (`limit_conn_zone`)
- [ ] Request body size limited (`client_max_body_size`)
- [ ] Timeouts configured (prevent slowloris attacks)
- [ ] Server tokens hidden (`server_tokens off`)
- [ ] Security headers present:
  - [ ] `Strict-Transport-Security`
  - [ ] `X-Frame-Options`
  - [ ] `X-Content-Type-Options`
  - [ ] `X-XSS-Protection`
  - [ ] `Content-Security-Policy`
  - [ ] `Referrer-Policy`
  - [ ] `Permissions-Policy`
- [ ] Gzip compression enabled
- [ ] Static files served with proper cache headers
- [ ] Admin panel optionally IP-restricted

**Test Security Headers:**
```bash
curl -I https://your-domain.com

# Or use online tool:
# https://securityheaders.com/?q=your-domain.com
```

### 5. Docker & Container Security

- [ ] Containers run as non-root user
- [ ] Resource limits configured (CPU, memory)
- [ ] Secrets not hardcoded in Dockerfile
- [ ] Base images from official sources only
- [ ] Images regularly updated
- [ ] Unnecessary services/ports not exposed
- [ ] Docker daemon socket not exposed
- [ ] Container logs properly managed

**Security Scan:**
```bash
# Scan images for vulnerabilities
docker scan be-codepaathshala_django_app
```

### 6. Server Hardening

#### Firewall (UFW)
- [ ] UFW firewall enabled
- [ ] Only necessary ports open (22, 80, 443)
- [ ] SSH port changed from default 22 (recommended)
- [ ] Fail2ban installed and configured

```bash
# Verify firewall status
sudo ufw status verbose

# Check fail2ban
sudo fail2ban-client status sshd
```

#### SSH Security
- [ ] Password authentication disabled
- [ ] Root login disabled
- [ ] SSH key-based authentication only
- [ ] SSH port changed from 22 (optional but recommended)
- [ ] SSH idle timeout configured

```bash
# Verify SSH config
sudo sshd -T | grep -i "passwordauthentication\|permitrootlogin"
```

#### System Updates
- [ ] Operating system fully updated
- [ ] Automatic security updates enabled
- [ ] Package manager cache updated

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install unattended-upgrades -y
```

### 7. Application Security

#### Code Security
- [ ] No hardcoded secrets in code
- [ ] SQL injection protection (using ORM)
- [ ] XSS protection (template auto-escaping)
- [ ] CSRF protection enabled
- [ ] File upload validation and size limits
- [ ] User input validation and sanitization
- [ ] Proper authentication on all protected endpoints
- [ ] Proper authorization checks (permission classes)

#### Dependencies
- [ ] All dependencies up to date
- [ ] No known vulnerabilities in dependencies
  ```bash
  pip install pip-audit
  pip-audit
  ```
- [ ] `requirements.txt` pinned to specific versions
- [ ] Regular dependency updates scheduled

#### API Security
- [ ] Rate limiting on authentication endpoints
- [ ] Account lockout after failed login attempts (optional)
- [ ] Password complexity requirements enforced
- [ ] Sensitive endpoints require authentication
- [ ] API responses don't leak sensitive info

### 8. Logging & Monitoring

#### Logging
- [ ] Application logs configured
- [ ] Log rotation configured
- [ ] Error logs monitored
- [ ] Access logs enabled
- [ ] Sensitive data not logged (passwords, tokens)
- [ ] Log levels appropriate (INFO in production)

#### Monitoring
- [ ] Uptime monitoring configured
- [ ] Error tracking enabled (Sentry recommended)
- [ ] Performance monitoring (optional: New Relic, Datadog)
- [ ] Disk space monitoring
- [ ] CPU/Memory monitoring
- [ ] Alert notifications configured

**Setup Monitoring:**
```bash
# Simple uptime check
curl -fsS -m 10 --retry 5 -o /dev/null https://your-domain.com/health/ || echo "Site down!"

# Add to cron (every 5 minutes)
*/5 * * * * /path/to/uptime-check.sh
```

### 9. Redis Security

- [ ] Redis password authentication enabled
- [ ] Redis not exposed to internet
- [ ] Redis only accessible via Docker network
- [ ] Memory limits configured
- [ ] Persistence enabled (AOF or RDB)
- [ ] Redis commands restricted (if needed)

**Test Redis:**
```bash
# Verify password authentication required
docker exec -it redis redis-cli ping
# Should return: (error) NOAUTH Authentication required.

docker exec -it redis redis-cli -a YOUR_PASSWORD ping
# Should return: PONG
```

### 10. Celery Security

- [ ] Celery broker secured (Redis password)
- [ ] Task time limits configured
- [ ] Worker concurrency appropriate
- [ ] Tasks don't process untrusted data unsafely
- [ ] Celery flower (if used) is password-protected

---

## 🛡️ Post-Deployment Security Verification

### Automated Security Tests

Run these tests after deployment:

```bash
# 1. SSL/TLS Test
curl -I https://your-domain.com | grep -i "strict-transport-security"

# 2. HTTP to HTTPS Redirect
curl -I http://your-domain.com | grep -i "location"

# 3. Security Headers
curl -I https://your-domain.com

# 4. Rate Limiting Test
for i in {1..30}; do curl -s -o /dev/null -w "%{http_code}\n" https://your-domain.com/api/login/; done

# 5. CORS Test
curl -H "Origin: https://malicious-site.com" -I https://your-domain.com/api/

# 6. Authentication Required
curl -I https://your-domain.com/api/user/profile/
```

### Online Security Scanners

Run these external tests:

1. **SSL Labs:** https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com
   - Target: A+ rating

2. **Security Headers:** https://securityheaders.com/?q=your-domain.com
   - Target: A rating

3. **Mozilla Observatory:** https://observatory.mozilla.org/analyze/your-domain.com
   - Target: A+ rating

4. **Qualys Scan:** https://www.qualys.com/forms/freescan/
   - Run comprehensive vulnerability scan

### Penetration Testing (Recommended)

Consider running these tools:

```bash
# OWASP ZAP (web application security scanner)
# Download from: https://www.zaproxy.org/

# Nikto (web server scanner)
nikto -h https://your-domain.com

# Nmap (port scanner)
nmap -sV -sC your-server-ip
```

**⚠️ Only run penetration tests on your own infrastructure!**

---

## 🚨 Incident Response Plan

### Security Breach Procedure

If you detect a security breach:

1. **Immediate Actions:**
   ```bash
   # Stop all services
   docker-compose -f docker-compose.production.yml down

   # Block all access at firewall
   sudo ufw deny from any to any

   # Preserve logs
   cp -r /var/log /backup/incident-logs-$(date +%Y%m%d)
   ```

2. **Investigation:**
   - Review all access logs
   - Check for unauthorized database access
   - Identify compromised accounts
   - Determine attack vector

3. **Recovery:**
   - Restore from clean backup
   - Rotate ALL secrets (DATABASE_PASSWORD, SECRET_KEY, etc.)
   - Force logout all users (change SECRET_KEY)
   - Patch vulnerability
   - Restore services gradually

4. **Post-Incident:**
   - Document incident
   - Update security measures
   - Notify affected users (if required by law)
   - Review and improve security

### Contact Information

Keep these ready:

- [ ] Server provider support contact
- [ ] Domain registrar support
- [ ] Legal counsel (for data breaches)
- [ ] Cybersecurity insurance (if applicable)

---

## 📊 Security Metrics

Track these metrics monthly:

| Metric | Target | How to Check |
|--------|--------|--------------|
| Failed login attempts | < 5% of total | Check Django logs |
| SSL certificate expiry | > 30 days | `openssl` command |
| Dependency vulnerabilities | 0 critical | `pip-audit` |
| Uptime | > 99.9% | Monitoring service |
| Average response time | < 500ms | APM tool |
| Blocked IPs (rate limit) | Track trends | Nginx logs |
| Database backup success | 100% | Cron logs |

---

## ✅ Final Security Sign-Off

Before going live, confirm:

- [ ] All items in this checklist completed
- [ ] At least 2 people reviewed configuration
- [ ] Backup and restore tested
- [ ] Monitoring and alerts active
- [ ] Incident response plan documented
- [ ] Team trained on security procedures
- [ ] Security review scheduled (quarterly)

**Sign-off:**
- Deployed by: ________________
- Reviewed by: ________________
- Date: ________________

---

## 📚 Security Resources

### Essential Reading
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django Security](https://docs.djangoproject.com/en/4.2/topics/security/)
- [Docker Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Tools
- **Sentry:** https://sentry.io (error tracking)
- **fail2ban:** https://www.fail2ban.org/
- **OWASP ZAP:** https://www.zaproxy.org/
- **pip-audit:** https://pypi.org/project/pip-audit/

### Stay Updated
- Subscribe to security mailing lists:
  - Django security: https://www.djangoproject.com/weblog/
  - PostgreSQL security: https://www.postgresql.org/support/security/
  - OWASP: https://owasp.org/

---

**Security is an ongoing process, not a one-time task. Schedule regular security reviews!**

*Last Updated: 2024*
