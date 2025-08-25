# Facebook Ads Reporting Dashboard

Modern Next.js application providing comprehensive Facebook Ads data collection and reporting for multiple clients with admin controls and professional client dashboards.

## 🎯 Key Features
- **Dual Authentication**: Admin (custom table) + Client (Supabase Auth) unified login
- **Manual Data Control**: Admin-triggered Facebook Ads collection
- **Multi-Client Dashboard**: Secure individual client portals
- **Role-Based Access**: JWT middleware protection
- **Modern UI**: shadcn/ui components with responsive design
- **Facebook Integration**: 7 data types collection via Graph API v20.0

## 🏗️ Architecture
```
Next.js App Router → Supabase PostgreSQL → Facebook Graph API
    ├── Admin Panel (Client Mgmt, Data Scraping)
    ├── API Routes (Auth, Data Collection)
    └── Client Dashboards (Monthly Reports)
```

---

## ⚙️ Setup

### Prerequisites
- Node.js 18+, Supabase account, Facebook Business account with ad access

### Installation
```bash
npm install
```

### Environment (.env.local)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
JWT_SECRET=your_jwt_secret_key_here
ADMIN_SETUP_KEY=admin-setup-123
```

### Working Test Credentials
- **Admin**: `admin@fotoplane.com` / `Fotoplane@1` → `/admin`
- **Client**: `ankur@fotoplane.com` / `Fotoplane@1` → `/client`

### Project Structure
```
app/
├── api/auth/          # Unified authentication
├── admin/             # Admin dashboard & client management  
├── client/            # Client reports dashboard
└── login/             # Unified login page

lib/
├── auth.ts            # JWT utilities
├── supabase.ts        # Database operations
├── facebook-api.ts    # Graph API integration
└── data-*.ts          # Validation & storage

components/ui/         # shadcn/ui library (30+ components)
middleware.ts          # Route protection
```

---

## 📊 Facebook Integration

### Data Types Collected (7 via Graph API v20.0)
1. **Campaign Performance**: `campaign_id`, `spend`, `clicks`, `impressions`, `ctr`
2. **Demographics**: Age/gender breakdowns with reach and actions
3. **Regional Performance**: Geographic performance data
4. **Device Performance**: Platform-specific metrics
5. **Platform Breakdown**: Publisher platform position data  
6. **Hourly Performance**: Time-based performance patterns
7. **Ad-Level Performance**: Individual ad metrics and performance

---

## 🔗 API Routes

### Authentication
- `POST /api/auth` - Unified login (admin + client)
- `DELETE /api/auth` - Logout with cookie clear

### Admin Routes  
- `GET/POST/PUT/DELETE /api/admin/clients` - Client CRUD operations
- `POST /api/admin/test-scrape` - Manual data collection

### Client Routes
- `GET /api/client/reports` - Monthly reports access

### Testing
- `GET/POST /api/test-facebook` - Facebook API connectivity tests

---

## 🗄️ Database Schema

### Authentication System
**Dual authentication approach**:
- **Admin**: Custom `admins` table with bcrypt + JWT (7-day tokens)
- **Client**: Supabase Auth `auth.users` table with compatible JWT
- **Unified**: Single login endpoint tries admin first, then client

### Core Tables
```sql
-- Business entities
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  fb_ad_account_id TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data storage
CREATE TABLE monthly_reports (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- '2025-01'
  report_data JSONB NOT NULL, -- Complete Facebook API response
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, month_year)
);

-- Admin authentication  
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hashed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```


---

## 🚀 Deployment & Development

### Vercel Deployment (Recommended)
```bash
npm i -g vercel
vercel login
vercel --prod
```

Configure environment variables in Vercel dashboard with the same `.env.local` values.

### Development Commands
```bash
npm run dev          # Development server
npm run build        # Type checking & build
npm run lint         # Code linting
```

### Adding Components
```bash
npx shadcn@latest add [component-name]  # Add shadcn/ui components
```

---

## 🔧 Troubleshooting

### Common Issues
1. **Environment Variables**: Ensure `.env.local` exists, restart dev server after changes
2. **Database Connection**: Verify Supabase URL/keys, check tables exist
3. **Facebook API**: Regenerate access token, verify `ads_read` permissions
4. **Authentication**: Test with provided credentials, check JWT_SECRET is set
5. **Build Errors**: Run `npm run build` to check TypeScript issues

### Authentication Test
```bash
# Test admin login:
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fotoplane.com","password":"Fotoplane@1"}'
```

---

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Check logs, monitor database, verify Facebook token
- **Monthly**: Update dependencies (`npm audit && npm update`), clean old data
- **Quarterly**: Security audit, Facebook API updates, performance review

### Data Cleanup
```sql
-- Clean reports older than 2 years
DELETE FROM monthly_reports WHERE scraped_at < NOW() - INTERVAL '2 years';
```

---

## 🎯 Implementation Status

### ✅ Completed Features
- **Dual Authentication System**: Unified login with admin (custom table) + client (Supabase Auth)
- **Admin Dashboard**: Client management, data collection controls, CRUD operations
- **Client Dashboard**: Role-based access, report viewing interface
- **API Infrastructure**: Facebook integration, data validation, testing endpoints
- **UI/UX**: Complete shadcn/ui library, responsive design, professional styling
- **Route Protection**: JWT middleware with role-based access control

### 🔄 Next Steps
- Real data integration for client dashboards
- Monthly report visualization with charts
- PDF/CSV export functionality
- Enhanced data analytics features

### 🧪 Testing

#### Quick Start
```bash
npm run dev
# Visit: http://localhost:3000/login
```

#### Test Authentication
Use provided credentials to test both user types:
- **Admin**: `admin@fotoplane.com` / `Fotoplane@1` → `/admin`
- **Client**: `ankur@fotoplane.com` / `Fotoplane@1` → `/client`

#### Verification Checklist
- [ ] Admin login redirects to admin dashboard
- [ ] Client login redirects to client dashboard
- [ ] Route protection prevents cross-role access
- [ ] Logout functionality works correctly
- [ ] Facebook API connectivity (optional)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.4.0 | 2025-08-25 | ✅ Complete unified authentication system with working credentials |
| 2.3.0 | 2025-01-22 | ✅ Dual authentication, admin/client dashboards, role-based routing |
| 2.2.0 | 2025-01-22 | ✅ Enhanced Facebook API with validation and testing |
| 2.1.0 | 2025-01-22 | ✅ Database setup, core libraries, Facebook API integration |
| 2.0.0 | 2025-01-XX | **Major Rewrite**: Migrated from N8N to Next.js App Router |

### Migration Benefits (v1.x → v2.x)
- **Full Control**: Manual data collection vs automation failures  
- **Modern Stack**: Latest React, Next.js, TypeScript, Tailwind CSS
- **Unified Auth**: Single login interface with dual backend support
- **Cost Effective**: Vercel + Supabase free tiers
- **Simplified Architecture**: Single codebase vs N8N + separate frontend

---

*Modern Next.js Facebook Ads Reporting Dashboard with unified authentication and professional client interfaces.*
