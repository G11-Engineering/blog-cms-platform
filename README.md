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

## 🔐 Authentication & Authorization

This platform uses **WSO2 Asgardeo** for secure authentication (2FA) while managing roles locally.

### User Registration

New users can register via Asgardeo SSO:

1. Click **"Sign Up"** in the navigation bar
2. Fill in your details via Asgardeo's secure registration
3. Verify your email
4. Login with Asgardeo SSO

All new users receive the **"reader"** role by default. Admins can upgrade roles via the admin panel.

### User Roles

- **Admin** - Full platform access including user management
- **Editor** - Manage all content and moderate comments
- **Author** - Create and manage own blog posts
- **Reader** - View published content (default for new users)

### Authentication Architecture

**Asgardeo is used ONLY for authentication (2FA), NOT for role management.**

1. **Registration**: Users sign up via Asgardeo
2. **JIT Provisioning**: On first login, local account created with "reader" role
3. **Role Management**: Admins assign roles (author/editor/admin) via admin panel
4. **User Status Sync**: When admin deactivates a user, their Asgardeo account is locked automatically

**Why this approach?**
- Asgardeo provides secure 2FA authentication
- Local role management allows flexible, blog-specific permissions
- User status syncs to Asgardeo to prevent locked-out users from accessing via SSO

### Default Admin User

For initial setup, a default admin user is available:

- **Email:** admin@cms.com
- **Password:** admin123
- **Role:** admin

**Note:** For local development only. Change in production!

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

**Important:** Copy `.env.example` to `.env` in the project root and fill in your credentials. See [SETUP.md](SETUP.md) for detailed instructions.

Example environment variables for each service:

#### User Service (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user_service:user_password@localhost:5433/user_service
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Asgardeo SSO Configuration
ASGARDEO_BASE_URL=https://api.asgardeo.io/t/your-org-name
ASGARDEO_CLIENT_ID=your-frontend-client-id
ASGARDEO_CLIENT_SECRET=your-frontend-client-secret
ASGARDEO_ORG_NAME=your-org-name

# Asgardeo M2M Configuration (User Status Sync)
ASGARDEO_M2M_CLIENT_ID=your-m2m-client-id
ASGARDEO_M2M_CLIENT_SECRET=your-m2m-client-secret
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
NEXT_PUBLIC_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/your-org-name
NEXT_PUBLIC_ASGARDEO_CLIENT_ID=your-frontend-client-id
NEXT_PUBLIC_ASGARDEO_REDIRECT_URL=http://localhost:3000
NEXT_PUBLIC_ASGARDEO_SCOPE=openid profile email
```

### Asgardeo Configuration

For detailed Asgardeo setup instructions, see [SETUP.md](SETUP.md).

Quick overview:

1. **Create Asgardeo Organization**
   - Sign up at https://console.asgardeo.io/
   - Create a new organization

2. **Create Frontend Application (Traditional Web Application)**
   - Navigate to Applications → New Application
   - Select "Traditional Web Application"
   - Configure authorized redirect URLs
   - Enable self-registration in "Login Flow" tab
   - Note the Client ID and Client Secret

3. **Create M2M Application (for User Sync)**
   - Navigate to Applications → New Application
   - Select "Machine to Machine"
   - Grant API scopes: `internal_user_mgt_update`, `internal_user_mgt_view`
   - Enable SCIM2 Users API authorization
   - Note the Client ID and Client Secret

4. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Asgardeo credentials
   - See [SETUP.md](SETUP.md) for detailed instructions

**Important:** Asgardeo is used ONLY for 2FA authentication. Roles are managed locally in the admin panel, NOT via Asgardeo groups

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
