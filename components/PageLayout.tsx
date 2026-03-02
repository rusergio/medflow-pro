import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** Layout padrão para páginas: título, descrição, ações e conteúdo */
export const PageLayout: React.FC<PageLayoutProps> = ({ title, description, actions, children }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
    {children}
  </div>
);

interface PageCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/** Card de conteúdo para páginas */
export const PageCard: React.FC<PageCardProps> = ({ title, children, className }) => (
  <Card className={className}>
    {title && (
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
    )}
    <CardContent className={title ? 'pt-0' : ''}>{children}</CardContent>
  </Card>
);
