# 🎓 CodePaathshala - B2B EdTech Platform

**Advanced coding assessment, testing, and learning management system for educational institutions.**

---

## 🚀 Quick Start

### For Local Development (Your Computer)

```bash
# 1. Setup environment
cp be-codepaathshala/.env.dev be-codepaathshala/.env

# 2. Start everything
docker-compose -f docker-compose.dev.yml up --build

# 3. Access application
# Frontend: http://localhost:3001
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin
```

**📖 Full Guide:** See [LOCAL_SETUP_GUIDE.md](LOCAL_SETUP_GUIDE.md)

### For Production Deployment (Live Server)

```bash
# 1. Setup environment
cp .env.production.example .env.production
nano .env.production  # Add your secrets

# 2. Configure SSL
nano be-codepaathshala/nginx/default.conf.production  # Add your domain

# 3. Deploy
docker-compose -f docker-compose.production.yml up -d
```

**📖 Full Guide:** See [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)

---

## 📁 Project Structure

```
cp/
├── be-codepaathshala/          # Django Backend (Python)
│   ├── accounts/               # User management & auth
│   ├── assessment_V2/          # Assessment system
│   ├── batches/                # Course batch management
│   ├── judge0/                 # Code execution
│   └── codingjudge/            # Django settings
│
├── codepaathshala/             # React Frontend (TypeScript)
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   └── state/              # Redux state
│   └── package.json
│
├── docker-compose.dev.yml      # Local development
├── docker-compose.production.yml # Production deployment
└── Documentation files...
```

---

## 🛠️ Tech Stack

**Backend:**
- Django 4.2 + Django REST Framework
- PostgreSQL 15 database
- Redis for caching
- Celery for background tasks
- JWT authentication

**Frontend:**
- React 18 with TypeScript
- Redux for state management
- Material-UI components
- Monaco Editor for code editing
- Socket.io for real-time features

**Infrastructure:**
- Docker & Docker Compose
- Nginx web server
- Let's Encrypt SSL certificates
- Celery Beat for scheduled tasks

---

## ✨ Features

### For Students
- 📝 Code in 10+ programming languages
- 📊 Real-time code execution & testing
- 🎯 Interactive assessments with MCQs, coding, and subjective questions
- 📹 Video lectures with transcripts
- 💬 Discussion forums
- 📈 Progress tracking & analytics

### For Administrators
- 🎓 Batch & student management
- 📋 Create custom assessments
- 📊 Detailed performance reports
- 🔍 Code plagiarism detection
- 👥 User role management
- 📧 Email notifications

### Security Features
- 🔒 HTTPS/SSL encryption
- 🛡️ CSRF & XSS protection
- 🚦 Rate limiting & DDoS protection
- 🔐 JWT token authentication
- 📹 Proctored exam support
- 🔑 Secure password policies

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [LOCAL_SETUP_GUIDE.md](LOCAL_SETUP_GUIDE.md) | **Start here!** Run locally on your computer |
| [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md) | Deploy to production server |
| [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) | Security verification checklist |
| [DEPLOYMENT_SECURITY_SUMMARY.md](DEPLOYMENT_SECURITY_SUMMARY.md) | Quick security reference |

---

## 🔧 Common Commands

### Development

```bash
# Start services
docker-compose -f docker-compose.dev.yml up

# Stop services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Run Django commands
docker-compose -f docker-compose.dev.yml exec django_app python manage.py <command>

# Create admin user
docker-compose -f docker-compose.dev.yml exec django_app python manage.py createsuperuser
```

### Production

```bash
# Start services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Backup database
./be-codepaathshala/scripts/backup_database.sh

# Check SSL certificate
docker-compose -f docker-compose.production.yml exec nginx nginx -t
```

---

## 🧪 Testing

```bash
# Run backend tests
docker-compose -f docker-compose.dev.yml exec django_app python manage.py test

# Run frontend tests
docker-compose -f docker-compose.dev.yml exec frontend npm test

# Check code coverage
docker-compose -f docker-compose.dev.yml exec django_app coverage run --source='.' manage.py test
docker-compose -f docker-compose.dev.yml exec django_app coverage report
```

---

## 🔐 Environment Variables

### Development (.env.dev)
- `DEBUG=True`
- Simple passwords
- CORS open
- Console email backend

### Production (.env.production)
- `DEBUG=False`
- Strong passwords (32+ chars)
- CORS whitelist only
- SMTP email backend
- SSL enabled

**⚠️ Never commit `.env` or `.env.production` to Git!**

---

## 📊 Database

### Models Overview

**Accounts:**
- Custom User model
- UserProfile with extended info
- JWT token management

**Batches:**
- Client organizations
- Batch & ChildBatch hierarchy
- Problems, MCQs, Assignments

**Assessment_V2:**
- Assessment container
- AssessmentItem sections
- ProblemSet, MCQSet, SubjectiveSet
- OpenAssessmentEvaluation

**Submissions:**
- Code submissions
- MCQ responses
- Grading & evaluation

---

## 🚀 Deployment Options

### Option 1: Docker on VPS (Recommended)
- DigitalOcean Droplet ($20/month)
- AWS EC2 instance
- Linode VPS
- Vultr Cloud Compute

### Option 2: Platform-as-a-Service
- Heroku
- Railway.app
- Render.com

### Option 3: Managed Kubernetes
- Google Kubernetes Engine (GKE)
- Amazon EKS
- Azure Kubernetes Service

**Recommended for beginners:** Start with Docker on a $20/month VPS

---

## 🔒 Security

**Current Security Status:**

✅ **Production-Ready:**
- SSL/TLS encryption
- Security headers (HSTS, CSP, etc.)
- Rate limiting
- CORS whitelist
- Secure cookies
- JWT tokens (1h lifetime)
- Database encryption
- Redis authentication

❌ **Still Need to Configure:**
- Generate unique SECRET_KEY
- Set strong database passwords
- Configure domain name
- Setup SSL certificates
- Configure SMTP email

**See:** [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) for complete checklist

---

## 📈 Performance

**Optimizations Included:**
- Nginx caching & compression
- Database connection pooling
- Redis caching layer
- Static file optimization
- Celery for async tasks

**Recommended Improvements:**
- Add database indexes
- Implement select_related/prefetch_related
- Add pagination to list endpoints
- Use CDN for static files
- Enable query caching

---

## 🐛 Troubleshooting

**Services won't start:**
```bash
# Check if ports are available
sudo lsof -i :8000
sudo lsof -i :3001

# Check Docker is running
docker ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

**Database connection failed:**
```bash
# Restart postgres
docker-compose -f docker-compose.dev.yml restart postgres

# Check postgres is running
docker-compose -f docker-compose.dev.yml ps postgres
```

**Frontend won't load:**
```bash
# Rebuild frontend
docker-compose -f docker-compose.dev.yml build frontend
docker-compose -f docker-compose.dev.yml up -d frontend
```

**More help:** See [LOCAL_SETUP_GUIDE.md](LOCAL_SETUP_GUIDE.md) troubleshooting section

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit pull request

**Code Style:**
- Backend: PEP 8 (Python)
- Frontend: ESLint (TypeScript/React)
- Use meaningful variable names
- Add comments for complex logic

---

## 📄 License

[Add your license here]

---

## 📞 Support

**Issues?**
1. Check documentation files
2. Review logs: `docker-compose logs -f`
3. Search existing issues on GitHub
4. Create new issue with details

**Need Help?**
- Documentation: See guides above
- Email: [your-email]
- GitHub Issues: [your-repo]/issues

---

## 🎯 Roadmap

**Current Version:** 1.0
- ✅ Core assessment system
- ✅ Code execution engine
- ✅ User management
- ✅ Batch management
- ✅ Production security

**Future Enhancements:**
- [ ] API rate limiting per user
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] AI-powered code review
- [ ] Integration with LMS platforms

---

## 🏆 Credits

**Developed by:** CodePaathshala Team

**Built with:**
- Django & Django REST Framework
- React & Redux
- Docker & Docker Compose
- PostgreSQL & Redis
- Judge0 for code execution

---

## ⚡ Quick Links

- [Local Setup Guide](LOCAL_SETUP_GUIDE.md) - Run on your computer
- [Production Guide](PRODUCTION_DEPLOYMENT_GUIDE.md) - Deploy to server
- [Security Checklist](SECURITY_CHECKLIST.md) - Verify security
- [API Documentation](http://localhost:8000/api/) - API endpoints

---

**Ready to start?** Follow the [LOCAL_SETUP_GUIDE.md](LOCAL_SETUP_GUIDE.md)! 🚀

---

*Last Updated: November 2024*
