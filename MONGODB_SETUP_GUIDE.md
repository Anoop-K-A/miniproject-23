# MongoDB Setup Guide for Faculty Portal

## Option 1: MongoDB Atlas (Cloud Database - RECOMMENDED)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Start Free"**
3. Sign up with email
4. Create a new project (e.g., "Faculty Portal")

### Step 2: Create a Cluster

1. Click **"Create a Deployment"**
2. Choose **"M0 Sandbox"** (free, 512MB storage)
3. Select your region (choose closest to you)
4. Click **"Create Deployment"**
5. Wait 2-5 minutes for cluster to be ready

### Step 3: Create Database User

1. In the left menu, click **"Database Access"**
2. Click **"Add New Database User"**
3. Create username: `admin`
4. Create password: (save this password)
5. Click **"Add User"**

### Step 4: Configure Network Access

1. In the left menu, click **"Network Access"**
2. Click **"Add IP Address"**
3. Choose **"Allow Access from Anywhere"** (for development)
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Go back to "Databases"
2. Click **"Connect"** button
3. Choose **"Drivers"**
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<database>` with your actual values

### Example Connection String:

```
mongodb+srv://admin:yourpassword@faculty.xyz.mongodb.net/faculty-portal?retryWrites=true&w=majority
```

---

## Option 2: MongoDB Local (Windows)

### Step 1: Download & Install

1. Go to https://www.mongodb.com/try/download/community
2. Choose **"Windows MSI"**
3. Download and run installer
4. Follow the installation wizard
5. Choose **"Install MongoDB as a Windows Service"**

### Step 2: Start MongoDB

MongoDB should start automatically. To verify:

```powershell
# In PowerShell, run:
mongo --version
```

### Step 3: Connection String

```
mongodb://localhost:27017/faculty-portal
```

---

## Option 3: Docker (Containerized)

### Step 1: Install Docker

1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Install and start Docker

### Step 2: Run MongoDB Container

```powershell
docker run -d --name faculty-mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo
```

### Step 3: Connection String

```
mongodb://admin:password123@localhost:27017/faculty-portal?retryWrites=true
```

---

## Update .env.local

Once you've chosen an option, update your `.env.local` file with the correct MongoDB URI:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/faculty-portal

# MongoDB Atlas Example
MONGODB_URI=mongodb+srv://admin:yourpassword@faculty.xyz.mongodb.net/faculty-portal?retryWrites=true&w=majority

# Docker Example
MONGODB_URI=mongodb://admin:password123@localhost:27017/faculty-portal?retryWrites=true
```

---

## Verify MongoDB Connection

After updating the connection string, restart the backend:

```powershell
cd backend
npm run dev
```

You should see:

```
✅ MongoDB connected successfully
✅ Backend server running on port 5000
```

---

## Test Admin Account Setup

Once MongoDB is connected:

```powershell
cd backend
npm run seed-admin
```

Expected output:

```
✅ Admin Account Setup Complete!
Email: anoopka.6.7.2004@gmail.com
Password: 123456
```
