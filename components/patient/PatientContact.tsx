import React from 'react';
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PatientContact: React.FC = () => {
  const contacts = [
    { icon: PhoneIcon, label: 'Telefone', value: '+351 212 345 678', href: 'tel:+351212345678' },
    { icon: MailIcon, label: 'Email', value: 'contacto@medflowpro.pt', href: 'mailto:contacto@medflowpro.pt' },
    { icon: MapPinIcon, label: 'Morada', value: 'Av. da Saúde, 1234-567 Lisboa, Portugal', href: undefined },
    { icon: ClockIcon, label: 'Horário', value: 'Seg–Sex: 8h–20h | Sáb: 9h–13h', href: undefined },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">Contacto</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map(({ icon: Icon, label, value, href }) => (
          <Card key={label}>
            <CardContent className="py-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="text-slate-800 dark:text-white font-medium hover:text-primary transition-colors"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-slate-800 dark:text-white font-medium">{value}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Urgências</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Em caso de emergência, dirija-se ao serviço de urgências ou ligue o{' '}
            <a href="tel:112" className="text-primary font-semibold hover:underline">112</a>.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Urgências do Hospital: <strong>+351 212 345 999</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientContact;
