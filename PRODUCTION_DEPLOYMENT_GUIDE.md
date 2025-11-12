# 🚀 Production Deployment Guide - CodePaathshala

**Complete guide to deploy CodePaathshala securely in production**

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [SSL Certificate Setup](#ssl-certificate-setup)
4. [Environment Configuration](#environment-configuration)
5. [Deployment Steps](#deployment-steps)
6. [Security Checklist](#security-checklist)
7. [Post-Deployment](#post-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Infrastructure
- **Server**: Ubuntu 22.04 LTS (minimum 4GB RAM, 2 CPU cores, 50GB SSD)
- **Domain**: Registered domain name (e.g., codepaathshala.com)
- **DNS**: Domain pointing to your server IP
- **Email**: SMTP credentials (Gmail, SendGrid, or AWS SES)

### Software Requirements
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Install Git
sudo apt install git -y

# Install fail2ban (intrusion prevention)
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Install UFW Firewall
sudo apt install ufw -y
```

---

## 🖥️ Server Setup

### 1. Configure Firewall
```bash
# Allow SSH (change 22 to your custom SSH port if changed)
sudo ufw allow 22/tcp

# Allow HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

### 2. Secure SSH (Highly Recommended)
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Make these changes:
# PermitRootLogin no
# PasswordAuthentication no  # Use SSH keys only
# Port 2222  # Change default port (optional but recommended)

# Restart SSH
sudo systemctl restart sshd
```

### 3. Clone Repository
```bash
# Create application directory
mkdir -p /opt/codepaathshala
cd /opt/codepaathshala

# Clone repository
git clone <your-repository-url> .

# Set proper permissions
sudo chown -R $USER:$USER /opt/codepaathshala
```

---

## 🔐 SSL Certificate Setup

### Method 1: Let's Encrypt (FREE - Recommended)

#### Step 1: Initial Nginx Setup (HTTP only)
```bash
cd /opt/codepaathshala

# Copy production nginx config
cp be-codepaathshala/nginx/default.conf.production be-codepaathshala/nginx/default.conf

# Edit and replace "your-domain.com" with your actual domain
nano be-codepaathshala/nginx/default.conf
```

#### Step 2: Start Services (HTTP only for certificate generation)
```bash
# Create temporary nginx config for certbot
cat > be-codepaathshala/nginx/default.conf << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # REPLACE

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Server is running';
        add_header Content-Type text/plain;
    }
}
EOF

# Start only nginx and certbot
docker-compose -f docker-compose.production.yml up -d nginx certbot
```

#### Step 3: Generate SSL Certificates
```bash
# Generate certificates (REPLACE your-email@example.com and your-domain.com)
docker-compose -f docker-compose.production.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d your-domain.com \
    -d www.your-domain.com

# Verify certificates were created
docker exec nginx ls -la /etc/letsencrypt/live/your-domain.com/
```

#### Step 4: Enable HTTPS Configuration
```bash
# Now copy the full production config
cp be-codepaathshala/nginx/default.conf.production be-codepaathshala/nginx/default.conf

# Edit and replace ALL instances of "your-domain.com"
nano be-codepaathshala/nginx/default.conf

# Restart nginx with SSL
docker-compose -f docker-compose.production.yml restart nginx
```

### Certificate Auto-Renewal
Certificates auto-renew via the certbot container. Verify with:
```bash
docker-compose -f docker-compose.production.yml run --rm certbot renew --dry-run
```

---

## ⚙️ Environment Configuration

### 1. Create Production Environment File
```bash
cd /opt/codepaathshala

# Copy template
cp .env.production.example .env.production

# Edit configuration
nano .env.production
```

### 2. Generate Secret Keys
```bash
# Generate Django SECRET_KEY
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Generate strong passwords (32 characters)
openssl rand -base64 32
```

### 3. Required Environment Variables

**CRITICAL - Must Change:**
```env
SECRET_KEY=<50-char-random-string>
DB_PASSWORD=<32-char-password>
REDIS_PASSWORD=<32-char-password>
EMAIL_HOST_PASSWORD=<your-smtp-password>
```

**Domain Configuration:**
```env
ALLOWED_HOSTS=codepaathshala.com,www.codepaathshala.com,api.codepaathshala.com
CORS_ORIGIN_WHITELIST=https://codepaathshala.com,https://www.codepaathshala.com
CSRF_TRUSTED_ORIGINS=https://codepaathshala.com,https://www.codepaathshala.com
```

**Email Configuration (Example: Gmail):**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@your-domain.com
EMAIL_HOST_PASSWORD=<app-specific-password>
EMAIL_USE_TLS=True
```

---

## 🚢 Deployment Steps

### 1. Build and Start Services
```bash
cd /opt/codepaathshala

# Build images
docker-compose -f docker-compose.production.yml build

# Start all services
docker-compose -f docker-compose.production.yml up -d

# Verify all containers are running
docker-compose -f docker-compose.production.yml ps
```

### 2. Run Database Migrations
```bash
# Run migrations
docker-compose -f docker-compose.production.yml exec django_app python manage.py migrate --settings=codingjudge.settings_production

# Create superuser
docker-compose -f docker-compose.production.yml exec django_app python manage.py createsuperuser --settings=codingjudge.settings_production

# Collect static files
docker-compose -f docker-compose.production.yml exec django_app python manage.py collectstatic --noinput --settings=codingjudge.settings_production
```

### 3. Verify Deployment
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs -f

# Test HTTPS
curl -I https://your-domain.com

# Test API endpoint
curl https://your-domain.com/api/health/

# Check SSL grade (external)
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com
```

---

## ✅ Security Checklist

### Pre-Deployment Security Audit

- [ ] **Environment Variables**
  - [ ] SECRET_KEY is unique and never committed to Git
  - [ ] DEBUG=False in production
  - [ ] Strong database password (32+ characters)
  - [ ] Strong Redis password
  - [ ] CORS_ORIGIN_ALLOW_ALL=False

- [ ] **SSL/TLS**
  - [ ] Valid SSL certificate installed
  - [ ] HTTPS redirects working
  - [ ] SSL grade A or higher (check SSLLabs)
  - [ ] HSTS headers enabled

- [ ] **Database**
  - [ ] PostgreSQL password changed from default
  - [ ] Database not exposed to internet (no external ports)
  - [ ] Automated backups configured
  - [ ] Connection pooling enabled

- [ ] **Django Settings**
  - [ ] ALLOWED_HOSTS configured correctly
  - [ ] SESSION_COOKIE_SECURE=True
  - [ ] CSRF_COOKIE_SECURE=True
  - [ ] JWT token lifetime reduced (max 1 hour)

- [ ] **Nginx**
  - [ ] Rate limiting configured
  - [ ] Security headers enabled
  - [ ] Request size limits set
  - [ ] Admin panel IP restricted (optional)

- [ ] **Server**
  - [ ] Firewall (UFW) enabled
  - [ ] SSH key-based authentication only
  - [ ] Fail2ban installed and running
  - [ ] Non-root user for deployment

- [ ] **Dependencies**
  - [ ] All packages updated to latest secure versions
  - [ ] No known vulnerabilities (check with `pip-audit`)
  - [ ] Docker images from trusted sources

### Post-Deployment Verification

Run these tests:
```bash
# 1. Test HTTPS redirect
curl -I http://your-domain.com
# Should return 301 redirect to https://

# 2. Test security headers
curl -I https://your-domain.com
# Should include: Strict-Transport-Security, X-Frame-Options, etc.

# 3. Test rate limiting
# Run this multiple times rapidly:
for i in {1..20}; do curl https://your-domain.com/api/endpoint/; done
# Should see 429 Too Many Requests after threshold

# 4. Test database connection
docker-compose -f docker-compose.production.yml exec django_app python manage.py dbshell --settings=codingjudge.settings_production
```

---

## 📊 Post-Deployment

### 1. Setup Database Backups
```bash
# Make backup script executable
chmod +x be-codepaathshala/scripts/backup_database.sh

# Test backup manually
./be-codepaathshala/scripts/backup_database.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /opt/codepaathshala/be-codepaathshala/scripts/backup_database.sh >> /var/log/db_backup.log 2>&1
```

### 2. Setup Log Rotation
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/codepaathshala

# Add:
/opt/codepaathshala/be-codepaathshala/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### 3. Setup Monitoring (Optional but Recommended)

#### Option A: Simple Uptime Monitoring
- Sign up for free at: https://uptimerobot.com
- Add your domain for HTTP(S) monitoring
- Configure alerts via email/SMS

#### Option B: Sentry Error Tracking
```bash
# 1. Sign up at https://sentry.io (free tier available)
# 2. Create new Django project
# 3. Get your DSN
# 4. Add to .env.production:
SENTRY_DSN=https://your-key@sentry.io/your-project
SENTRY_ENVIRONMENT=production
```

### 4. Application Performance Monitoring

Install New Relic (free tier):
```bash
# Add to requirements.txt
echo "newrelic" >> be-codepaathshala/requirements.txt

# Rebuild
docker-compose -f docker-compose.production.yml build django_app

# Configure
# Follow: https://docs.newrelic.com/docs/apm/agents/python-agent/
```

---

## 🔍 Monitoring & Maintenance

### Daily Checks
```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# Check disk usage
df -h

# Check logs for errors
docker-compose -f docker-compose.production.yml logs --tail=100 django_app | grep ERROR

# Check failed login attempts
sudo journalctl -u sshd | grep "Failed password"
```

### Weekly Checks
```bash
# Update Docker images
docker-compose -f docker-compose.production.yml pull

# Review backup status
ls -lh /app/backups/

# Check SSL certificate expiry
docker-compose -f docker-compose.production.yml exec nginx openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -noout -dates

# Security updates
sudo apt update && sudo apt upgrade -y
```

### Monthly Checks
- Review Sentry/monitoring dashboards
- Analyze traffic patterns (Nginx access logs)
- Update dependencies if security patches available
- Test backup restoration process

---

## 🛠️ Troubleshooting

### Issue: SSL Certificate Not Working

**Symptoms:** Browser shows "Not Secure" or certificate errors

**Solutions:**
```bash
# 1. Verify certificate files exist
docker exec nginx ls -la /etc/letsencrypt/live/your-domain.com/

# 2. Check nginx configuration
docker exec nginx nginx -t

# 3. Verify DNS records
nslookup your-domain.com

# 4. Regenerate certificate
docker-compose -f docker-compose.production.yml run --rm certbot certonly --force-renew \
    --webroot --webroot-path=/var/www/certbot \
    -d your-domain.com -d www.your-domain.com
```

### Issue: 502 Bad Gateway

**Symptoms:** Nginx returns 502 error

**Solutions:**
```bash
# 1. Check if Django app is running
docker-compose -f docker-compose.production.yml ps django_app

# 2. Check Django app logs
docker-compose -f docker-compose.production.yml logs django_app

# 3. Restart Django app
docker-compose -f docker-compose.production.yml restart django_app

# 4. Check database connection
docker-compose -f docker-compose.production.yml exec django_app python manage.py dbshell --settings=codingjudge.settings_production
```

### Issue: Database Connection Failed

**Symptoms:** Django can't connect to PostgreSQL

**Solutions:**
```bash
# 1. Verify PostgreSQL is running
docker-compose -f docker-compose.production.yml ps postgres

# 2. Check database credentials in .env.production
cat .env.production | grep DB_

# 3. Test connection manually
docker-compose -f docker-compose.production.yml exec postgres psql -U cp_prod_user -d codepaathshala_prod

# 4. Check PostgreSQL logs
docker-compose -f docker-compose.production.yml logs postgres
```

### Issue: Out of Memory / High CPU

**Symptoms:** Server becomes unresponsive

**Solutions:**
```bash
# 1. Check resource usage
docker stats

# 2. Check system resources
htop
free -h
df -h

# 3. Restart specific service
docker-compose -f docker-compose.production.yml restart <service_name>

# 4. Scale Celery workers down if needed
# Edit docker-compose.production.yml and reduce concurrency

# 5. Add swap space (if RAM < 4GB)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Issue: Rate Limiting Too Aggressive

**Symptoms:** Legitimate users getting blocked

**Solutions:**
```bash
# Edit nginx config
nano be-codepaathshala/nginx/default.conf

# Increase rate limits:
# limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;  # Increase from 10r/s
# limit_req zone=api_limit burst=50 nodelay;  # Increase burst

# Reload nginx
docker-compose -f docker-compose.production.yml exec nginx nginx -s reload
```

---

## 📞 Support & Resources

### Useful Commands
```bash
# View all logs
docker-compose -f docker-compose.production.yml logs -f

# Enter Django shell
docker-compose -f docker-compose.production.yml exec django_app python manage.py shell --settings=codingjudge.settings_production

# Database backup
./be-codepaathshala/scripts/backup_database.sh

# Restore from backup
gunzip -c /app/backups/db_backup_20240101_120000.sql.gz | \
    docker exec -i postgres psql -U cp_prod_user -d codepaathshala_prod

# Restart all services
docker-compose -f docker-compose.production.yml restart

# Stop all services
docker-compose -f docker-compose.production.yml down

# View resource usage
docker-compose -f docker-compose.production.yml exec django_app top
```

### Security Resources
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **SSL Test:** https://www.ssllabs.com/ssltest/
- **Security Headers:** https://securityheaders.com/
- **Django Security:** https://docs.djangoproject.com/en/4.2/topics/security/

### Monitoring Tools
- **Uptime Robot:** https://uptimerobot.com (free)
- **Sentry:** https://sentry.io (error tracking)
- **New Relic:** https://newrelic.com (APM)
- **Datadog:** https://www.datadoghq.com/ (infrastructure)

---

## 🎯 Next Steps for Optimization

After securing your deployment, consider these performance improvements:

1. **Add Database Indexes** - See `PERFORMANCE_OPTIMIZATION_GUIDE.md`
2. **Implement Caching** - Use Redis for frequently accessed data
3. **CDN Integration** - CloudFlare or AWS CloudFront for static files
4. **Load Balancer** - For high traffic (Nginx load balancing or AWS ALB)
5. **Database Read Replicas** - For scaling read-heavy workloads
6. **Auto-scaling** - Kubernetes or AWS ECS for automatic scaling

---

## ✅ Deployment Checklist Summary

**Before Going Live:**
- [ ] SSL certificate installed and working
- [ ] All `.env.production` secrets configured
- [ ] DEBUG=False confirmed
- [ ] Database backups automated
- [ ] Monitoring/alerts configured
- [ ] Firewall rules active
- [ ] SSH secured (key-only, non-standard port)
- [ ] DNS records correct
- [ ] Email sending tested
- [ ] Password reset flow tested
- [ ] Admin panel accessible and secured
- [ ] Security headers verified (securityheaders.com)
- [ ] SSL grade A+ achieved (ssllabs.com)
- [ ] Load testing performed
- [ ] Disaster recovery plan documented

**Congratulations! Your application is now production-ready and secure! 🎉**

---

*Last Updated: 2024*
*Maintainer: CodePaathshala Team*
