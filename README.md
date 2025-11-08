# CMS Blog Platform

A fully functional CMS/Blog platform built with microservices architecture, featuring a React/Next.js frontend with Mantine UI and TipTap editor, backed by multiple Node.js microservices.

## 🚀 Features

### Frontend
- **Next.js 14** with App Router and Server-Side Rendering
- **Mantine UI** component library for modern, accessible interface
- **TipTap Editor** for rich text content creation
- **React Query** for efficient data fetching and caching
- **TypeScript** for type safety

### Backend Microservices
- **User Service** - Authentication, user management, roles (admin, editor, author, reader)
- **Content Service** - CRUD operations for posts, drafts, versioning, scheduled publishing
- **Media Service** - File uploads, image processing, thumbnails
- **Category & Tag Service** - Content organization and filtering
- **Comment Service** - Comments, replies, moderation system

### Database
- **PostgreSQL** with separate schemas for each microservice
- **Database migrations** and initialization scripts
- **Optimized indexes** for performance

### Key Features
- ✅ User authentication with JWT tokens
- ✅ Role-based access control
- ✅ Rich text editor with image uploads
- ✅ Post scheduling and versioning
- ✅ Media management with thumbnails
- ✅ Categories and tags system
- ✅ Comments with moderation
- ✅ Responsive design
- ✅ Docker Compose for easy setup

## 📋 Prerequisites

- **Node.js** 18+ 
- **Docker** and **Docker Compose**
- **Git**

## 🛠️ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cms-blog-platform
```

### 2. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

This will start:
- 6 PostgreSQL databases (one per microservice)
- 5 Node.js microservices
- 1 Next.js frontend
- All services will be available on their respective ports

### 3. Install Dependencies (Alternative to Docker)

If you prefer to run services locally:

```bash
# Install root dependencies
npm install

# Install all service dependencies
npm run install:all
```

### 4. Start Services Locally

```bash
# Start all services in development mode
npm run dev

# Or start services individually
npm run dev:user      # User Service (port 3001)
npm run dev:content   # Content Service (port 3002)
npm run dev:media     # Media Service (port 3003)
npm run dev:category  # Category Service (port 3004)
npm run dev:comment   # Comment Service (port 3005)
npm run dev:frontend  # Frontend (port 3000)
```

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js application |
| User Service | http://localhost:3001 | Authentication & user management |
| Content Service | http://localhost:3002 | Posts & content management |
| Media Service | http://localhost:3003 | File uploads & media |
| Category Service | http://localhost:3004 | Categories & tags |
| Comment Service | http://localhost:3005 | Comments & moderation |

## 🔐 Authentication & User Registration

This platform uses **WSO2 Asgardeo** for secure identity management and authentication.

### User Registration

New users can register via Asgardeo SSO self-registration:

1. Click **"Sign Up"** in the navigation bar
2. You'll be redirected to Asgardeo's secure registration page
3. Fill in your details and verify your email
4. Return to the platform and click **"Login"** to access via SSO
5. All new users are automatically assigned the **"Author"** role

### User Roles

- **Admin** - Full platform access including user management
- **Editor** - Manage all content and moderate comments
- **Author** - Create and manage own blog posts (default for new users)
- **Reader** - View published content

### Authentication Flow

1. **Self-Registration**: Users register via Asgardeo
2. **Email Verification**: Asgardeo handles email verification
3. **Group Assignment**: New users are added to "CMS_Authors" group automatically
4. **JIT Provisioning**: On first login, user account is created locally with "author" role
5. **Role Mapping**: Asgardeo groups map to local roles:
   - Groups containing "admin" → Admin role
   - Groups containing "editor" → Editor role
   - Groups containing "author" → Author role
   - Default → Author role

### Default Admin User

For testing and initial setup, a default admin user is available:

- **Email:** admin@cms.com
- **Password:** admin123
- **Role:** admin

**Note:** This is for local development only. Remove or change in production!

## 📁 Project Structure

```
cms-blog-platform/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   └── services/        # API services
│   └── package.json
├── services/                 # Microservices
│   ├── user-service/        # Authentication & users
│   ├── content-service/     # Posts & content
│   ├── media-service/       # File uploads
│   ├── category-service/    # Categories & tags
│   └── comment-service/     # Comments
├── database/                # Database schemas
│   ├── init/               # Database initialization
│   └── schemas/            # Service-specific schemas
├── docker-compose.yml       # Docker Compose configuration
└── package.json            # Root package.json
```

## 🗄️ Database Schema

Each microservice has its own PostgreSQL database:

### User Service Database
- `users` - User accounts and profiles
- `user_sessions` - JWT token sessions
- `user_profiles` - Extended user information

### Content Service Database
- `posts` - Blog posts and articles
- `post_versions` - Post version history
- `post_categories` - Post-category relationships
- `post_tags` - Post-tag relationships
- `post_views` - View tracking

### Media Service Database
- `media_files` - Uploaded files metadata
- `media_thumbnails` - Generated thumbnails
- `media_usage` - File usage tracking

### Category Service Database
- `categories` - Content categories
- `tags` - Content tags
- `category_hierarchy` - Category relationships

### Comment Service Database
- `comments` - User comments
- `comment_moderation` - Moderation actions
- `comment_likes` - Comment likes

## 🔧 Development

### Adding New Features

1. **Frontend Changes**: Edit files in `frontend/src/`
2. **Backend Changes**: Edit files in `services/[service-name]/src/`
3. **Database Changes**: Update schemas in `database/schemas/`

### API Documentation

Each service exposes REST APIs:

#### User Service APIs
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

#### Content Service APIs
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/publish` - Publish post

#### Media Service APIs
- `GET /api/media` - List media files
- `POST /api/media/upload` - Upload files
- `PUT /api/media/:id` - Update media metadata
- `DELETE /api/media/:id` - Delete media

#### Category Service APIs
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag

#### Comment Service APIs
- `GET /api/comments` - List comments
- `POST /api/comments` - Create comment
- `POST /api/comments/:id/like` - Like comment
- `POST /api/comments/:id/moderate` - Moderate comment

### Environment Variables

Create `.env` files in each service directory:

#### User Service (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user_service:user_password@localhost:5433/user_service
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

#### Content Service (.env)
```env
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://content_service:content_password@localhost:5434/content_service
```

#### Media Service (.env)
```env
NODE_ENV=development
PORT=3003
DATABASE_URL=postgresql://media_service:media_password@localhost:5435/media_service
UPLOAD_PATH=/app/uploads
```

#### Category Service (.env)
```env
NODE_ENV=development
PORT=3004
DATABASE_URL=postgresql://category_service:category_password@localhost:5436/category_service
```

#### Comment Service (.env)
```env
NODE_ENV=development
PORT=3005
DATABASE_URL=postgresql://comment_service:comment_password@localhost:5437/comment_service
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_CONTENT_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_MEDIA_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_CATEGORY_SERVICE_URL=http://localhost:3004
NEXT_PUBLIC_COMMENT_SERVICE_URL=http://localhost:3005

# Asgardeo Configuration
NEXT_PUBLIC_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/g11engineering
NEXT_PUBLIC_ASGARDEO_CLIENT_ID=Y4Yrhdn2PcIxQRLfWYDdEycYTfUa
NEXT_PUBLIC_ASGARDEO_REDIRECT_URL=http://localhost:3000
NEXT_PUBLIC_ASGARDEO_SCOPE=openid profile email groups
```

### Asgardeo Configuration

To enable user registration and authentication via Asgardeo:

1. **Enable Self-Registration**
   - Log into Asgardeo Console: https://console.asgardeo.io/
   - Navigate to your application
   - Go to "Login Flow" tab
   - Enable "Self Registration"
   - Configure email verification (recommended)

2. **Create User Groups**
   - Navigate to User Management → Groups
   - Create the following groups:
     - `CMS_Authors` - Default group for new users (author role)
     - `CMS_Editors` - For content editors (editor role)
     - `CMS_Admins` - For platform administrators (admin role)

3. **Configure Automatic Group Assignment**
   - Navigate to Workflows → Self Registration
   - Add post-registration action: "Add to Group"
   - Select group: `CMS_Authors`
   - This ensures all self-registered users get the author role

4. **Update Application Scopes**
   - Navigate to Applications → Your App → Protocol
   - Ensure these scopes are enabled:
     - `openid` (required)
     - `profile` (required)
     - `email` (required)
     - `groups` (required for role mapping)

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm run test

# Run frontend tests
npm run test:frontend

# Run service tests
npm run test:services
```

### Manual Testing

1. **Access the frontend**: http://localhost:3000
2. **Login with admin credentials**: admin@cms.com / admin123
3. **Create a new post**: Navigate to "Create Post"
4. **Upload media**: Use the media upload feature
5. **Test comments**: Add comments to posts
6. **Test categories**: Create and assign categories

## 🚀 Deployment

### Production Build

```bash
# Build all services
npm run build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup

For production deployment:

1. Update environment variables
2. Configure database connections
3. Set up file storage (AWS S3, etc.)
4. Configure reverse proxy (Nginx)
5. Set up SSL certificates

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000-3007 are available
2. **Database connection**: Check PostgreSQL is running
3. **File uploads**: Verify upload directory permissions
4. **CORS errors**: Check service URLs in frontend config

### Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f user-service
docker-compose logs -f frontend
```

### Reset Database

```bash
# Stop services
docker-compose down

# Remove volumes
docker-compose down -v

# Restart services
docker-compose up -d
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Mantine UI Documentation](https://mantine.dev/)
- [TipTap Editor Documentation](https://tiptap.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section
2. Review service logs
3. Create an issue with detailed information
4. Include error messages and steps to reproduce

---

**Happy coding! 🎉**
