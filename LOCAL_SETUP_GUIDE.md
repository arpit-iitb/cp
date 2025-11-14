# 🚀 Local Development Setup Guide - CodePaathshala

**Complete guide to run CodePaathshala on your local machine for development**

---

## 📋 What You'll Need

### Required Software

1. **Docker Desktop** (includes Docker Compose)
   - **Windows/Mac:** Download from https://www.docker.com/products/docker-desktop
   - **Linux:**
     ```bash
     curl -fsSL https://get.docker.com -o get-docker.sh
     sudo sh get-docker.sh
     sudo apt install docker-compose-plugin
     ```

2. **Git** (to clone the repository)
   - **Windows/Mac:** Download from https://git-scm.com/downloads
   - **Linux:** `sudo apt install git`

3. **A Code Editor** (optional but recommended)
   - VS Code (recommended): https://code.visualstudio.com/
   - Or any text editor you prefer

### System Requirements
- **RAM:** 4GB minimum (8GB recommended)
- **Disk Space:** 5GB free space
- **OS:** Windows 10+, macOS 10.14+, or Linux

---

## 🎯 Quick Start (5 Minutes)

If you just want to get it running quickly:

```bash
# 1. Navigate to project directory
cd /path/to/codepaathshala

# 2. Copy development environment file
cp be-codepaathshala/.env.dev be-codepaathshala/.env

# 3. Start everything with Docker
docker-compose -f docker-compose.dev.yml up --build

# 4. Open in browser:
# Backend API: http://localhost:8000
# Frontend: http://localhost:3001
# Admin Panel: http://localhost:8000/admin
```

**That's it!** The first build takes 5-10 minutes, then you're ready to code!

---

## 📖 Detailed Setup Guide

### Step 1: Get the Code

```bash
# Clone the repository (if you haven't already)
git clone <your-repository-url>
cd cp

# Or if you already have it, make sure you're in the project directory
cd /home/user/cp
```

### Step 2: Setup Environment Variables

```bash
# Copy the development environment file
cp be-codepaathshala/.env.dev be-codepaathshala/.env

# View the file (optional)
cat be-codepaathshala/.env
```

**What's in this file?**
- `DEBUG=True` - Shows detailed error pages (helpful for development)
- `DB_PASSWORD=dev_password_123` - Simple password for local database
- `EMAIL_BACKEND=console` - Emails print to console instead of sending
- All settings are safe for local development

**You don't need to change anything!** These defaults work out of the box.

### Step 3: Start Docker Services

```bash
# Build and start all services
docker-compose -f docker-compose.dev.yml up --build
```

**What's happening?**
This command will:
1. ✅ Build Docker images (5-10 minutes first time)
2. ✅ Start PostgreSQL database
3. ✅ Start Redis cache
4. ✅ Start Django backend (API)
5. ✅ Start Celery workers (background tasks)
6. ✅ Start Frontend (React app)
7. ✅ Run database migrations
8. ✅ Collect static files

**First-time build:** 5-10 minutes (downloads dependencies)
**Subsequent starts:** 10-30 seconds

### Step 4: Create Admin User

Open a **new terminal** (keep the previous one running) and run:

```bash
# Create a superuser account
docker-compose -f docker-compose.dev.yml exec django_app python manage.py createsuperuser

# Follow the prompts:
# Username: admin (or whatever you like)
# Email: admin@example.com
# Password: admin123 (or your choice)
```

### Step 5: Access Your Application

Open your browser and visit:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3001 | React web application |
| **Backend API** | http://localhost:8000 | Django REST API |
| **Admin Panel** | http://localhost:8000/admin | Django admin interface |
| **API Docs** | http://localhost:8000/api/ | Browsable API |

**Login to admin panel:**
- Username: `admin` (or what you created)
- Password: `admin123` (or what you created)

---

## 🛠️ Common Commands

### Starting and Stopping

```bash
# Start services (after first build)
docker-compose -f docker-compose.dev.yml up

# Start in background (detached mode)
docker-compose -f docker-compose.dev.yml up -d

# Stop services (keeps data)
docker-compose -f docker-compose.dev.yml down

# Stop and remove all data (fresh start)
docker-compose -f docker-compose.dev.yml down -v
```

### Viewing Logs

```bash
# View all logs
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f django_app
docker-compose -f docker-compose.dev.yml logs -f postgres
docker-compose -f docker-compose.dev.yml logs -f frontend
```

### Running Django Commands

```bash
# Run migrations
docker-compose -f docker-compose.dev.yml exec django_app python manage.py migrate

# Create superuser
docker-compose -f docker-compose.dev.yml exec django_app python manage.py createsuperuser

# Open Django shell
docker-compose -f docker-compose.dev.yml exec django_app python manage.py shell

# Run tests
docker-compose -f docker-compose.dev.yml exec django_app python manage.py test

# Collect static files
docker-compose -f docker-compose.dev.yml exec django_app python manage.py collectstatic --noinput
```

### Database Commands

```bash
# Access PostgreSQL shell
docker-compose -f docker-compose.dev.yml exec postgres psql -U cp_user -d codepaathshala_db

# Backup database
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U cp_user codepaathshala_db > backup.sql

# Restore database
cat backup.sql | docker-compose -f docker-compose.dev.yml exec -T postgres psql -U cp_user -d codepaathshala_db
```

### Frontend Commands

```bash
# Install new npm package
docker-compose -f docker-compose.dev.yml exec frontend npm install <package-name>

# Rebuild frontend
docker-compose -f docker-compose.dev.yml restart frontend

# View frontend logs
docker-compose -f docker-compose.dev.yml logs -f frontend
```

---

## 🔧 Development Workflow

### Making Code Changes

**Backend (Django):**
1. Edit files in `be-codepaathshala/` directory
2. Changes are automatically detected (hot reload enabled)
3. Refresh browser to see changes

**Frontend (React):**
1. Edit files in `codepaathshala/src/` directory
2. Changes automatically reload in browser (hot reload)
3. No need to refresh manually

### Adding Dependencies

**Backend (Python):**
```bash
# 1. Add package to requirements.txt
echo "new-package==1.0.0" >> be-codepaathshala/requirements.txt

# 2. Rebuild Django container
docker-compose -f docker-compose.dev.yml build django_app
docker-compose -f docker-compose.dev.yml up -d django_app
```

**Frontend (Node.js):**
```bash
# Install package
docker-compose -f docker-compose.dev.yml exec frontend npm install new-package

# Or rebuild container
docker-compose -f docker-compose.dev.yml build frontend
docker-compose -f docker-compose.dev.yml up -d frontend
```

### Running Database Migrations

After changing models:

```bash
# 1. Create migration files
docker-compose -f docker-compose.dev.yml exec django_app python manage.py makemigrations

# 2. Apply migrations
docker-compose -f docker-compose.dev.yml exec django_app python manage.py migrate

# 3. View migration status
docker-compose -f docker-compose.dev.yml exec django_app python manage.py showmigrations
```

---

## 🐛 Troubleshooting

### Issue: "Port already in use"

**Problem:** Another service is using port 8000, 3001, or 5432

**Solution:**
```bash
# Option 1: Stop conflicting service
# Find what's using the port
sudo lsof -i :8000  # Replace 8000 with your port

# Kill the process
sudo kill -9 <PID>

# Option 2: Change port in docker-compose.dev.yml
# Edit the ports section, e.g., change "8000:8000" to "8080:8000"
```

### Issue: "Database connection failed"

**Problem:** PostgreSQL isn't ready yet

**Solution:**
```bash
# Wait 10 seconds, then try again
# Or check if postgres is running:
docker-compose -f docker-compose.dev.yml ps postgres

# Restart postgres:
docker-compose -f docker-compose.dev.yml restart postgres
```

### Issue: "No module named 'somepackage'"

**Problem:** Python package not installed

**Solution:**
```bash
# Rebuild Django container
docker-compose -f docker-compose.dev.yml build django_app
docker-compose -f docker-compose.dev.yml up -d django_app
```

### Issue: "npm install failed" or frontend won't start

**Problem:** Node modules issue

**Solution:**
```bash
# Remove and reinstall node_modules
docker-compose -f docker-compose.dev.yml down
docker volume rm cp_node_modules  # If volume exists
docker-compose -f docker-compose.dev.yml build frontend --no-cache
docker-compose -f docker-compose.dev.yml up frontend
```

### Issue: "Everything is slow"

**Problem:** Docker performance on Windows/Mac

**Solution:**
```bash
# 1. Increase Docker Desktop memory
# Docker Desktop → Settings → Resources → Memory (increase to 4GB+)

# 2. Clean up Docker
docker system prune -a --volumes
# Warning: This removes all unused containers, images, and volumes
```

### Issue: "Cannot access admin panel"

**Problem:** Superuser not created

**Solution:**
```bash
# Create superuser
docker-compose -f docker-compose.dev.yml exec django_app python manage.py createsuperuser
```

### Complete Reset (Nuclear Option)

If everything is broken:

```bash
# 1. Stop everything
docker-compose -f docker-compose.dev.yml down -v

# 2. Remove all Docker images
docker-compose -f docker-compose.dev.yml down --rmi all

# 3. Clean Docker system
docker system prune -a --volumes

# 4. Start fresh
cp be-codepaathshala/.env.dev be-codepaathshala/.env
docker-compose -f docker-compose.dev.yml up --build
```

---

## 📂 Project Structure

```
cp/
├── be-codepaathshala/          # Django Backend
│   ├── accounts/               # User authentication
│   ├── assessment_V2/          # Assessments
│   ├── batches/                # Course batches
│   ├── codingjudge/            # Main Django settings
│   ├── submissions/            # Code submissions
│   ├── .env                    # Environment variables (create this)
│   ├── .env.dev                # Development template
│   ├── manage.py               # Django management script
│   └── requirements.txt        # Python dependencies
│
├── codepaathshala/             # React Frontend
│   ├── public/                 # Static files
│   ├── src/                    # React source code
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   └── state/              # Redux state management
│   ├── package.json            # Node dependencies
│   └── Dockerfile.dev          # Development Docker config
│
├── docker-compose.dev.yml      # Development Docker setup
├── docker-compose.production.yml # Production Docker setup
└── LOCAL_SETUP_GUIDE.md        # This file!
```

---

## 💡 Understanding the Stack

**What each service does:**

**Django (Backend):**
- Runs on port 8000
- Handles API requests
- Manages database
- Processes authentication
- Serves admin panel

**PostgreSQL (Database):**
- Runs on port 5432
- Stores all application data
- Users, assessments, submissions, etc.

**Redis (Cache):**
- Runs on port 6379
- Caches frequently accessed data
- Message broker for Celery

**Celery (Background Tasks):**
- Runs background jobs
- Processes code submissions
- Sends emails
- Scheduled tasks

**Judge0 (Code Execution):**
- Runs on port 3000
- Executes user code safely
- Returns results

**React Frontend:**
- Runs on port 3001
- User interface
- Communicates with Django API

---

## 🎓 Next Steps

### For Development

1. **Explore Admin Panel:** http://localhost:8000/admin
   - Create test users
   - Add problems
   - Create assessments

2. **Test API Endpoints:** http://localhost:8000/api/
   - Try the browsable API
   - Test authentication
   - See data format

3. **Modify Frontend:**
   - Edit files in `codepaathshala/src/`
   - Changes auto-reload
   - Check browser console for errors

4. **Add Features:**
   - Create new Django apps
   - Add React components
   - Write tests

### Learn More

**Django Documentation:**
- Official docs: https://docs.djangoproject.com/
- REST Framework: https://www.django-rest-framework.org/

**React Documentation:**
- Official docs: https://react.dev/
- Redux: https://redux.js.org/

**Docker Documentation:**
- Docker docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/

---

## ✅ Quick Checklist

**Before you start coding:**
- [ ] Docker Desktop running
- [ ] All services started: `docker-compose -f docker-compose.dev.yml up`
- [ ] Backend accessible: http://localhost:8000
- [ ] Frontend accessible: http://localhost:3001
- [ ] Admin user created
- [ ] No errors in logs

**When you're done coding:**
- [ ] Save all files
- [ ] Test your changes
- [ ] Commit to Git (if ready)
- [ ] Stop services: `docker-compose -f docker-compose.dev.yml down`

---

## 🆘 Getting Help

**Error messages:**
1. Read the error carefully
2. Check logs: `docker-compose -f docker-compose.dev.yml logs -f`
3. Google the error message
4. Check troubleshooting section above

**Useful commands:**
```bash
# Check if services are running
docker-compose -f docker-compose.dev.yml ps

# Check service health
docker-compose -f docker-compose.dev.yml exec django_app python manage.py check

# View Django error pages
# Visit http://localhost:8000/api/ with DEBUG=True to see detailed errors
```

---

## 🎉 You're Ready!

**Your development environment is set up!**

**Key Differences: Development vs Production**

| Feature | Development (Local) | Production (Deployment) |
|---------|-------------------|-------------------------|
| File | `docker-compose.dev.yml` | `docker-compose.production.yml` |
| Debug | `DEBUG=True` | `DEBUG=False` |
| Database | Simple password | Strong password |
| SSL/HTTPS | Not needed | Required |
| Security | Relaxed (CORS open) | Strict (whitelist only) |
| Emails | Print to console | Send via SMTP |
| Purpose | Coding & testing | Real users |

**Remember:**
- ✅ Use `docker-compose.dev.yml` for local development
- ✅ Use `docker-compose.production.yml` for deployment
- ✅ Never use development settings in production!

**Happy coding! 🚀**

---

*Questions? Check the troubleshooting section or Docker logs first!*
