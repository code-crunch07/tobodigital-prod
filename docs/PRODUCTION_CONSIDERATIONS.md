# 🚀 Production Considerations & Migration Guide

This document outlines critical changes needed when moving from development to production, especially for **authentication** and **image handling**.

---

## ⚠️ Critical Production Issues

### 1. **Image Storage - CRITICAL** 🔴

**Current Implementation:**
- Images stored on local filesystem: `uploads/public/`
- Files are lost on server restarts (serverless platforms)
- No backup or redundancy
- Won't work on Vercel, Railway, or any serverless platform

**Production Solutions:**

#### Option A: Cloud Storage (Recommended)
Use cloud storage services like:
- **AWS S3** (with CloudFront CDN)
- **Cloudinary** (easiest, includes image optimization)
- **Google Cloud Storage**
- **Azure Blob Storage**
- **DigitalOcean Spaces**

#### Option B: Persistent Volume (VPS only)
If using VPS/CloudPanel:
- Mount persistent volume for `uploads/` directory
- Configure backups
- Works with current implementation

---

### 2. **JWT Secret Security** 🔴

**Current Issue:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
```

**Problem:** Default fallback is insecure and predictable.

**Production Fix:**
- **MUST** set `JWT_SECRET` environment variable
- Use strong random secret (min 32 characters)
- Never commit secrets to git
- Use different secrets for dev/staging/production

**Generate secure secret:**
```bash
openssl rand -base64 32
```

---

### 3. **CORS Configuration** 🟡

**Current:**
```typescript
app.use(cors()); // Allows ALL origins
```

**Production:**
```typescript
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://admin.yourdomain.com',
    'https://api.yourdomain.com',
    'http://localhost:3000' // Only for local dev
  ],
  credentials: true
}));
```

---

### 4. **Environment Variables** 🟡

**Required Production Variables:**

```env
# Backend (.env)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Image Storage (if using cloud)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
# OR
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## 📋 Migration Checklist

### Authentication
- [ ] Set strong `JWT_SECRET` (32+ characters, random)
- [ ] Remove default fallback in auth controller
- [ ] Configure CORS with specific allowed origins
- [ ] Set `JWT_EXPIRES_IN` appropriately (7d is good)
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Test token expiration handling

### Image Storage
- [ ] Choose cloud storage solution
- [ ] Update upload controller to use cloud storage
- [ ] Update image URL generation
- [ ] Migrate existing images to cloud
- [ ] Update frontend to use cloud URLs
- [ ] Configure CDN for image delivery (optional but recommended)
- [ ] Set up image backup strategy

### Security
- [ ] Enable HTTPS/SSL certificates
- [ ] Set secure cookie flags (if using cookies)
- [ ] Implement rate limiting
- [ ] Add request validation middleware
- [ ] Set up error logging (avoid exposing stack traces)
- [ ] Configure security headers

### Performance
- [ ] Enable image compression/optimization
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Optimize database queries
- [ ] Set up monitoring (Sentry, LogRocket, etc.)

---

## 🔧 Implementation Examples

### Example 1: Cloudinary Integration

**Install:**
```bash
npm install cloudinary
```

**Update `src/controllers/upload.ts`:**
```typescript
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'tobo-products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    };
  },
});

export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Cloudinary returns secure_url automatically
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: (req.file as any).path, // Cloudinary URL
        filename: (req.file as any).filename,
        originalname: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading file',
    });
  }
};
```

### Example 2: AWS S3 Integration

**Install:**
```bash
npm install aws-sdk multer-s3
```

**Update `src/controllers/upload.ts`:**
```typescript
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET!,
  acl: 'public-read',
  key: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `uploads/${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // S3 file location
    const fileUrl = (req.file as any).location;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: fileUrl, // Full S3 URL
        filename: (req.file as any).key,
        originalname: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading file',
    });
  }
};
```

### Example 3: Secure JWT Secret

**Update `src/controllers/auth.ts`:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Remove the fallback - fail fast if secret is missing
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
```

---

## 🌐 Platform-Specific Considerations

### Railway / Render / Fly.io (Serverless-like)
- ❌ **Cannot use local filesystem** for images
- ✅ **Must use cloud storage** (S3, Cloudinary, etc.)
- ✅ Static file serving won't work - use CDN
- ✅ Environment variables via platform dashboard

### VPS / CloudPanel (Traditional Server)
- ✅ Can use local filesystem with persistent volumes
- ✅ Static file serving works with Nginx
- ⚠️ Need backup strategy for uploads directory
- ✅ Can also use cloud storage for redundancy

### Vercel (Frontend only)
- ✅ Frontend deployment works fine
- ❌ Backend cannot be deployed on Vercel (use Railway/Render)
- ✅ Images served from cloud storage/CDN

---

## 🔄 Migration Steps

### Step 1: Choose Image Storage Solution
1. Sign up for cloud storage (Cloudinary recommended for ease)
2. Get API credentials
3. Test upload manually

### Step 2: Update Backend
1. Install required packages
2. Update `src/controllers/upload.ts`
3. Update environment variables
4. Test upload endpoint

### Step 3: Migrate Existing Images
1. Create migration script to upload existing images
2. Update database URLs
3. Verify all images accessible

### Step 4: Update Frontend
1. No changes needed if URLs are full URLs
2. If using relative paths, update to use full cloud URLs
3. Test image display

### Step 5: Security Hardening
1. Set JWT_SECRET
2. Configure CORS
3. Enable HTTPS
4. Set up monitoring

---

## 📊 Cost Estimates

### Cloudinary (Recommended for Start)
- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **Paid**: $99/month for 100GB storage, 100GB bandwidth
- **Pros**: Image optimization, CDN included, easy setup

### AWS S3
- **Storage**: ~$0.023/GB/month
- **Bandwidth**: ~$0.09/GB (first 10TB)
- **CloudFront CDN**: Additional cost
- **Pros**: Very scalable, industry standard
- **Cons**: More complex setup

### DigitalOcean Spaces
- **$5/month**: 250GB storage, 1TB bandwidth
- **Pros**: Simple pricing, S3-compatible

---

## ✅ Quick Start: Cloudinary (Easiest)

1. **Sign up**: https://cloudinary.com
2. **Get credentials** from dashboard
3. **Install**: `npm install cloudinary multer-storage-cloudinary`
4. **Update code** (see Example 1 above)
5. **Set env vars**:
   ```env
   CLOUDINARY_CLOUD_NAME=your-name
   CLOUDINARY_API_KEY=your-key
   CLOUDINARY_API_SECRET=your-secret
   ```
6. **Deploy** - images now stored in cloud!

---

## 🆘 Troubleshooting

### Images not loading in production
- Check if URLs are absolute (include https://)
- Verify CORS allows your frontend domain
- Check cloud storage bucket permissions (public-read)
- Verify environment variables are set correctly

### JWT authentication failing
- Verify JWT_SECRET is set and same across deployments
- Check token expiration time
- Verify Authorization header format: `Bearer <token>`
- Check CORS credentials setting

### Uploads failing
- Check file size limits (5MB default)
- Verify cloud storage credentials
- Check network connectivity from server
- Review cloud storage service logs

---

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [OWASP Security Cheat Sheet](https://cheatsheetseries.owasp.org/)

---

**Last Updated**: January 2026
