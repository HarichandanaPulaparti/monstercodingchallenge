# 🏆 Monster Coding Challenge - Flight Information System

A sophisticated, enterprise-grade flight information management system built with Angular 18 and Firebase. This application demonstrates advanced form validation, secure authentication, and modern UI/UX design principles.

![Angular](https://img.shields.io/badge/Angular-18-red?style=for-the-badge&logo=angular)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?style=for-the-badge&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![RxJS](https://img.shields.io/badge/RxJS-Reactive-purple?style=for-the-badge&logo=reactivex)

## 🚀 Features

### 🔐 **Enterprise Authentication**
- **Google Firebase Authentication** with popup signin
- **Smart Route Guards** preventing unauthorized access
- **Authentication State Management** with automatic redirects
- **Session Persistence** across browser sessions

### 🛡️ **Advanced Form Validation**
- **Real-time validation** with custom validators
- **Multi-layer validation** (client-side + business rules)
- **Smart error messaging** with field-specific feedback
- **Form state management** with reactive forms

### 🎨 **Modern UI/UX Design**
- **Glass-morphism effects** with backdrop filters
- **Responsive design** for all device sizes
- **Professional animations** and micro-interactions
- **Consistent Monster branding** with green color palette
- **Floating elements** and dynamic backgrounds

### 🔒 **Security Features**
- **Protected routes** with AuthGuard
- **Reverse authentication** preventing logged-in users from accessing login
- **Type-safe forms** with TypeScript
- **Input sanitization** and validation

### 📱 **Responsive & Accessible**
- **Mobile-first design** with touch-friendly interactions
- **Keyboard navigation** support
- **High contrast mode** compatibility
- **Reduced motion** support for accessibility
- **Screen reader** friendly components

## 🏗️ Architecture

### **Component Structure**
```
src/app/
├── components/
│   ├── home.component/          # Landing page with hero section
│   ├── login/                   # Google authentication
│   ├── flight-form/             # Flight information form
│   └── shared/
│       ├── navbar/              # Reusable navigation
│       └── success-modal/       # Success confirmation modal
├── guards/
│   ├── auth.guard.ts           # Route protection
│   └── login.guard.ts          # Reverse auth protection
├── services/
│   ├── auth.service.ts         # Firebase authentication
│   └── flight.service.ts       # Flight data management
└── environments/               # Environment configurations
```

### **Route Protection Strategy**
- **Home Page** (`/home`) - Public access
- **Login Page** (`/login`) - Protected by LoginGuard (redirects if authenticated)
- **Flight Form** (`/flightform`) - Protected by AuthGuard (requires authentication)

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 18.x or higher
- npm 9.x or higher
- Angular CLI 18.x
- Firebase project with Authentication enabled

### **1. Clone Repository**
```bash
git clone <your-repository-url>
cd flightchallenge
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Firebase Configuration**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Authentication** → **Sign-in method** → **Google**
4. Get your Firebase config from **Project Settings** → **General** → **Your apps**
5. Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
  }
};
```

### **4. Add Background Image**
Place your background image as `HomeBg.jpg` in the `public` folder:
```
public/
└── HomeBg.jpg
```

## 🚀 Running the Application

### **Development Server**
```bash
ng serve
```
Navigate to `http://localhost:4200/`. The application will automatically reload when you modify source files.

### **Production Build**
```bash
ng build --configuration production
```
Build artifacts will be stored in the `dist/` directory.

### **Testing**
```bash
# Unit tests
ng test

# End-to-end tests
ng e2e
```

## 🎯 Usage Flow

### **1. Home Page**
- Professional landing page with animated hero section
- Feature highlights and statistics
- Call-to-action button leading to login

### **2. Authentication**
- Click "Login" → Redirected to `/login`
- Google authentication popup
- Automatic redirect to flight form upon success

### **3. Flight Form**
- Comprehensive form with 6 fields
- Real-time validation feedback
- Professional success modal upon submission
- Automatic redirect to home page

### **4. Navigation**
- Consistent navbar across all pages
- User info display with avatar and sign-out option
- Smart routing based on authentication state

## 🔍 Validation Rules

### **Airline**
- Required field
- 2-50 characters
- Letters, spaces, and hyphens only
- Example: `Emirates`, `British Airways`

### **Flight Number**
- Required field
- Format: 2-3 letters + 1-4 digits
- Example: `EK123`, `BA1234`

### **Arrival Date**
- Required field
- Must be future date
- Standard date picker format

### **Arrival Time**
- Required field
- 24-hour format (HH:MM)
- Example: `14:30`, `09:15`

### **Number of Guests**
- Required field
- Positive integer
- Minimum: 1 guest

### **Comments**
- Optional field
- Additional information or special requests

## 🔐 Authentication Guards

### **AuthGuard**
```typescript
// Protects routes requiring authentication
canActivate(): Observable<boolean> {
  return this.authService.isAuthenticated().pipe(
    map(isAuth => {
      if (!isAuth) {
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
}
```

### **LoginGuard**
```typescript
// Prevents authenticated users from accessing login
canActivate(): Observable<boolean> {
  return this.authService.isAuthenticated().pipe(
    map(isAuth => {
      if (isAuth) {
        this.router.navigate(['/flightform']);
        return false;
      }
      return true;
    })
  );
}
```

## 🎨 Design System

### **Color Palette**
- **Primary Green**: `#6b9f5a` - Main brand color
- **Secondary Green**: `#4a7c59` - Buttons and accents
- **Dark Green**: `#2d573e` - Text and borders
- **Gold Accent**: `#ffd700` - Highlights and focus states

### **Typography**
- **Headings**: System fonts with gradient colors
- **Body Text**: Clean, readable hierarchy
- **Interactive Elements**: Bold weights with proper contrast

### **Animations**
- Smooth transitions (0.3s ease)
- Floating elements for visual interest
- Hover effects for better UX
- Loading states with spinners

## 🧪 Testing Features

### **Manual Testing Checklist**
- [ ] Home page loads with animations
- [ ] Login redirects properly based on auth state
- [ ] Form validation shows appropriate errors
- [ ] Successful submission shows modal
- [ ] Modal close redirects to home
- [ ] Navigation works across all pages
- [ ] Responsive design on mobile devices

### **Auth Flow Testing**
- [ ] Unauthenticated user can't access `/flightform`
- [ ] Authenticated user can't access `/login`
- [ ] Sign out works properly
- [ ] Page refresh maintains auth state

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 Development Notes

### **Code Standards**
- Standalone components for better tree-shaking
- Reactive forms with custom validators
- Type-safe service implementations
- Proper error handling throughout

## 🏆 Monster Coding Challenge

This project demonstrates:
- ✅ **Advanced Angular concepts** (Guards, Services, Reactive Forms)
- ✅ **Modern development practices** (TypeScript, RxJS, Standalone Components)
- ✅ **Professional UI/UX design** (Responsive, Accessible, Animated)
- ✅ **Enterprise-grade architecture** (Modular, Scalable, Maintainable)
- ✅ **Security best practices** (Route protection, Input validation)

---

**Built with ❤️ for Monster's Technical Assessment - Hari Chandana Pulaparti**

*Showcasing expertise in Angular, Firebase, TypeScript, and modern web development practices.*