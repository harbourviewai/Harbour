# Harbourview AI Strategy Dashboard

A comprehensive, multi-tenant SaaS application for AI strategy reporting and client management.

## 🚀 Features

- **🔐 Secure Authentication**: Role-based access (Admin, Executive, Team Lead, Viewer)
- **👥 Multi-tenant Architecture**: Complete client isolation and management
- **📊 Dynamic Dashboards**: Real-time data with interactive charts
- **🎨 Client Branding**: Custom logos, colors, and company information
- **📈 Analytics**: Comprehensive reporting and insights
- **💬 Feedback System**: Client feedback collection and management

## 🏗️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript, Chart.js
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI Integration**: Model Context Protocol (MCP)
- **Security**: Row-Level Security, JWT authentication

## 🚀 Quick Start

1. **Clone Repository**
   ```bash
   git clone https://github.com/harbourviewai/Harbour.git
   cd Harbour
   ```

2. **Set Up Supabase**
   - Create Supabase project
   - Run `database-schema.sql`
   - Update `supabase-config.js` with credentials

3. **Launch Application**
   - Open `login.html` in browser
   - Demo: demo@harbourview.ai / demo123

## 📁 Project Structure

```
├── 📄 HTML Pages
│   ├── login.html              # Mandatory login
│   ├── overview.html           # Main dashboard
│   ├── admin-dashboard.html    # Admin panel
│   └── client-admin.html       # Client management
├── 🔧 JavaScript Services
│   ├── auth-service.js         # Authentication
│   ├── admin-service.js        # Admin functions
│   └── overview-service.js     # Dashboard data
├── 🗄️ Database
│   └── database-schema.sql     # Complete schema
└── 📚 Documentation
    └── SCOPE.MD                # Development roadmap
```

## 👥 User Roles

- **Admin**: Full system access, client management
- **Executive**: Strategic overview, analytics
- **Team Lead**: Team management, project oversight
- **Viewer**: Read-only access, basic reporting

## 🔒 Security

- Row-Level Security (RLS)
- JWT authentication
- Client data isolation
- Role-based permissions

## 🚀 Deployment

### GitHub Pages
1. Enable GitHub Pages in repository settings
2. Access via: `https://harbourviewai.github.io/Harbour`

### Custom Hosting
1. Upload to web server
2. Configure Supabase CORS
3. Set up custom domain

## 📞 Support

- **Email**: support@harbourview.ai
- **Website**: https://harbourview.ai
- **Issues**: GitHub Issues

---

**© 2024 Harbourview AI. Built with ❤️ for AI strategy success.**