import React from 'react';
import { StorageService } from '../services/storage';
import { Download, Trash2, FileText } from 'lucide-react';
import { FormData } from '../types';

interface SavedForm {
  timestamp: string;
  formData: FormData;
  emailContent: string;
}

export const SavedForms: React.FC = () => {
  const [savedForms, setSavedForms] = React.useState<SavedForm[]>(StorageService.getSavedForms());

  const handleExport = (form: SavedForm) => {
    try {
      const blob = new Blob([form.emailContent], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fileName = `checklist-${form.formData.clientInfo.serviceStationName}-${new Date(form.timestamp).toLocaleDateString('uk-UA')}.html`;
      
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Помилка при експорті:', error);
      alert('Помилка при експорті файлу. Спробуйте ще раз.');
    }
  };

  const handleDelete = (timestamp: string) => {
    try {
      const updatedForms = savedForms.filter(form => form.timestamp !== timestamp);
      localStorage.setItem('checklist_saved_forms', JSON.stringify(updatedForms));
      setSavedForms(updatedForms);
    } catch (error) {
      console.error('Помилка при видаленні:', error);
      alert('Помилка при видаленні форми. Спробуйте ще раз.');
    }
  };

  if (savedForms.length === 0) {
    return (
      <div className="mt-8 bg-gray-800 p-6 rounded-lg text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-400">Немає збережених форм</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">
        Збережені форми ({savedForms.length})
      </h2>
      <div className="space-y-4">
        {savedForms.map((form) => (
          <div 
            key={form.timestamp} 
            className="bg-gray-700 p-4 rounded-lg flex items-center justify-between hover:bg-gray-600 transition-colors"
          >
            <div className="flex-1">
              <p className="text-gray-200 font-medium">
                {form.formData.clientInfo.serviceStationName || 'Без назви'}
              </p>
              <div className="text-sm text-gray-400 space-x-4">
                <span>
                  Дата: {new Date(form.timestamp).toLocaleString('uk-UA', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span>
                  Підрядник: {form.formData.contractor.companyName || 'Не вказано'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport(form)}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                title="Експортувати в HTML"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Експорт</span>
              </button>
              <button
                onClick={() => handleDelete(form.timestamp)}
                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                title="Видалити"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Видалити</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};