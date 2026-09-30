'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Stethoscope,
  Clock,
  Users,
  MessageSquareQuote,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Check auth status
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.authenticated) {
          setAdminUser(data.user);
        }
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { href: '/admin/doctors', label: 'Doctors', icon: UserCheck },
    { href: '/admin/services', label: 'Services', icon: Stethoscope },
    { href: '/admin/schedules', label: 'Schedules', icon: Clock },
    { href: '/admin/patients', label: 'Patients', icon: Users },
    { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="admin-shell">
      {/* Sidebar Desktop */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <Logo variant="light" size="sm" withLink={false} />
          <div style={{ fontSize: '0.72rem', color: '#38BDF8', marginTop: '0.4rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            ADMINISTRATION PORTAL
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #1E293B' }}>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-nav-item"
            style={{ marginBottom: '0.5rem', color: '#38BDF8' }}
          >
            <ExternalLink size={16} />
            <span>View Public Website</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ width: '100%', color: '#F87171' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle menu"
            >
              {mobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text-main)' }}>
              Madni Clinic Management
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-main)', lineHeight: 1.2 }}>
                  {adminUser?.name || 'Administrator'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {adminUser?.email || 'admin@madniclinic.com'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
