import React from 'react';
import { MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react';

const PatientFooter: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-3">MedFlow Pro</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              O seu hospital de confiança. Cuidamos de si com excelência e humanização.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-3">Contactos</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-primary shrink-0" />
                +351 212 345 678
              </li>
              <li className="flex items-center gap-2">
                <MailIcon className="w-4 h-4 text-primary shrink-0" />
                contacto@medflowpro.pt
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-3">Localização</h4>
            <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPinIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              Av. da Saúde, 1234-567 Lisboa, Portugal
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} MedFlow Pro. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default PatientFooter;
