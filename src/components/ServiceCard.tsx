import React from 'react';
import Link from 'next/link';
import { Service } from '@/lib/types';
import {
  Stethoscope,
  HeartPulse,
  Sparkles,
  Activity,
  UserCheck,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  // Select icon dynamically
  const renderIcon = () => {
    switch (service.icon) {
      case 'HeartPulse':
        return <HeartPulse size={24} />;
      case 'Sparkles':
        return <Sparkles size={24} />;
      case 'Activity':
        return <Activity size={24} />;
      case 'UserCheck':
        return <UserCheck size={24} />;
      default:
        return <Stethoscope size={24} />;
    }
  };

  return (
    <article className="service-card" aria-labelledby={`service-heading-${service.id}`}>
      <div className="service-icon-box" aria-hidden="true">
        {renderIcon()}
      </div>

      <div className="service-category-tag">{service.category}</div>

      <h3 id={`service-heading-${service.id}`} className="service-title">
        {service.name}
      </h3>

      <p className="service-desc">{service.description}</p>

      {service.doctor_name && (
        <div style={{ fontSize: '0.84rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '1rem' }}>
          Doctor: {service.doctor_name}
        </div>
      )}

      <div className="service-footer">
        <Link
          href={`/book-appointment?doctorId=${service.doctor_id}`}
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
        >
          <Calendar size={14} />
          <span>Book Slot</span>
        </Link>

        <Link
          href={`/services/${service.slug}`}
          className="btn btn-outline btn-sm"
          style={{ marginLeft: '0.5rem' }}
          aria-label={`Learn more about ${service.name}`}
        >
          <span>Details</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
}
