import React, { useEffect, useState } from 'react';
import { Footer } from './components/Footer.tsx';
import { FreeTrialModal } from './components/FreeTrialModal.tsx';
import { MembershipModal } from './components/MembershipModal.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { AdminLoginPage } from './pages/AdminLoginPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { CustomerDashboard } from './pages/CustomerDashboard.tsx';
import { FreeTrialPage } from './pages/FreeTrialPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { MembershipsPage } from './pages/MembershipsPage.tsx';
import { ProgramsPage } from './pages/ProgramsPage.tsx';
import { SchedulePage } from './pages/SchedulePage.tsx';
import { TrainersPage } from './pages/TrainersPage.tsx';
import { MembershipPlan } from './types/index.ts';

function MainApp() {
  const { user, adminUser } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [isFreeTrialOpen, setIsFreeTrialOpen] = useState(false);
  const [trialGoal, setTrialGoal] = useState<string | undefined>();
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  // Sync hash/path routing on mount and hashchange
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (path.includes('/admin/login') || hash === 'admin/login') {
        setCurrentView('admin-login');
      } else if (path.includes('/admin') || hash === 'admin' || hash === 'admin-dashboard') {
        setCurrentView(adminUser ? 'admin-dashboard' : 'admin-login');
      } else if (hash === 'programs') {
        setCurrentView('programs');
      } else if (hash === 'memberships') {
        setCurrentView('memberships');
      } else if (hash === 'trainers') {
        setCurrentView('trainers');
      } else if (hash === 'schedule' || hash === 'classes') {
        setCurrentView('classes');
      } else if (hash === 'free-trial') {
        setCurrentView('free-trial');
      } else if (hash === 'about') {
        setCurrentView('about');
      } else if (hash === 'contact') {
        setCurrentView('contact');
      } else if (hash === 'auth' || hash === 'login') {
        setCurrentView('auth');
      } else if (hash === 'dashboard') {
        setCurrentView(user ? 'customer-dashboard' : 'auth');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [user, adminUser]);

  const handleOpenFreeTrial = (goal?: string) => {
    setTrialGoal(goal);
    setIsFreeTrialOpen(true);
  };

  const handleSelectPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
  };

  // Render view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            setCurrentView={setCurrentView}
            onOpenFreeTrial={handleOpenFreeTrial}
            onSelectPlan={handleSelectPlan}
          />
        );
      case 'programs':
        return (
          <ProgramsPage
            onOpenFreeTrial={handleOpenFreeTrial}
            setCurrentView={setCurrentView}
          />
        );
      case 'memberships':
        return (
          <MembershipsPage
            onSelectPlan={handleSelectPlan}
            onOpenFreeTrial={handleOpenFreeTrial}
          />
        );
      case 'trainers':
        return (
          <TrainersPage
            onOpenFreeTrial={handleOpenFreeTrial}
            setCurrentView={setCurrentView}
          />
        );
      case 'classes':
        return <SchedulePage onNavigateToAuth={() => setCurrentView('auth')} />;
      case 'free-trial':
        return <FreeTrialPage />;
      case 'about':
        return (
          <AboutPage
            onOpenFreeTrial={handleOpenFreeTrial}
            setCurrentView={setCurrentView}
          />
        );
      case 'contact':
        return <ContactPage />;
      case 'auth':
        return (
          <AuthPage
            onSuccess={() => setCurrentView('customer-dashboard')}
            onNavigateToAdmin={() => setCurrentView('admin-login')}
          />
        );
      case 'customer-dashboard':
        return (
          <CustomerDashboard
            onNavigateToSchedule={() => setCurrentView('classes')}
            onNavigateToMemberships={() => setCurrentView('memberships')}
          />
        );
      case 'admin-login':
        return (
          <AdminLoginPage
            onSuccess={() => setCurrentView('admin-dashboard')}
            onBackToHome={() => setCurrentView('home')}
          />
        );
      case 'admin-dashboard':
        return <AdminDashboard onBackToHome={() => setCurrentView('home')} />;
      default:
        return (
          <HomePage
            setCurrentView={setCurrentView}
            onOpenFreeTrial={handleOpenFreeTrial}
            onSelectPlan={handleSelectPlan}
          />
        );
    }
  };

  const isAdminDashboard = currentView === 'admin-dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-[#EDEDED]">
      {/* Top Navbar (hidden in full admin workspace) */}
      {!isAdminDashboard && (
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenFreeTrial={handleOpenFreeTrial}
        />
      )}

      {/* Main Content */}
      <main className="flex-1">{renderCurrentView()}</main>

      {/* Footer */}
      {!isAdminDashboard && (
        <Footer
          setCurrentView={setCurrentView}
          onOpenFreeTrial={handleOpenFreeTrial}
        />
      )}

      {/* Modals */}
      <FreeTrialModal
        isOpen={isFreeTrialOpen}
        onClose={() => setIsFreeTrialOpen(false)}
        preselectedGoal={trialGoal}
      />

      <MembershipModal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        selectedPlan={selectedPlan}
        onNavigateToAuth={() => setCurrentView('auth')}
        onSuccess={() => {
          if (currentView === 'customer-dashboard') {
            window.location.reload();
          } else {
            setCurrentView('customer-dashboard');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
