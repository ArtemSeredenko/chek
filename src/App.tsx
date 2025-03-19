import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Camera, 
  HardDrive, 
  Wifi, 
  Router, 
  Battery, 
  Shield, 
  ListChecks, 
  Info,
  Zap,
  Lock,
  Network,
  PlayCircle,
  FileText,
  Plus,
  Mail,
  User,
  Building,
  Phone,
  MapPin,
  FileCheck
} from 'lucide-react';

type Equipment = {
  model: string;
  serialNumber?: string;
  location?: string;
  status: 'active' | 'inactive';
  quantity?: number;
  ipAddress?: string;
  port?: number;
  login?: string;
  password?: string;
};

type ClientInfo = {
  serviceStationName: string;
  serviceStationAddress: string;
  responsiblePerson: {
    name: string;
    phone: string;
    email: string;
    position: string;
  };
  itResponsible: {
    name: string;
    phone: string;
    email: string;
    position: string;
  };
};

type ContractorInfo = {
  companyName: string;
  fullName: string;
  phoneNumber: string;
  contactPerson: {
    name: string;
    phone: string;
    email: string;
    position: string;
  };
  serviceAreas: string[];
  licenseNumber: string;
  certifications: string[];
};

type Section = {
  title: string;
  icon: React.ReactNode;
  questions: {
    id: string;
    text: string;
    type: 'yesno' | 'select' | 'text' | 'multiselect' | 'equipment' | 'textarea' | 'number';
    options?: string[];
    equipment?: Equipment[];
  }[];
};

type FormData = {
  clientInfo: ClientInfo;
  contractor: ContractorInfo;
  equipment: Record<string, Equipment[]>;
  answers: Record<string, string | string[] | Equipment[]>;
};

import { StorageService } from './services/storage';
import { EmailService } from './services/email';
import { SavedForms } from './components/SavedForms';

const LOCAL_STORAGE_KEY = 'checklist_form_data';

function App() {
  const [formData, setFormData] = useState<FormData>(StorageService.loadFormData());
  
  useEffect(() => {
    StorageService.saveFormData(formData);
  }, [formData]);

  const [newEquipment, setNewEquipment] = useState<Equipment>({
    model: '',
    status: 'active',
    serialNumber: '',
    quantity: 1,
    location: '',
    ipAddress: '',
    port: undefined,
    login: '',
    password: ''
  });

  const [newArea, setNewArea] = useState('');

  const handleAddEquipment = (sectionId: string) => {
    if (newEquipment.model) {
      setFormData(prev => ({
        ...prev,
        equipment: {
          ...prev.equipment,
          [sectionId]: [...(prev.equipment[sectionId] || []), { ...newEquipment }]
        }
      }));
      setNewEquipment({
        model: '',
        status: 'active',
        serialNumber: '',
        quantity: 1,
        location: '',
        ipAddress: '',
        port: undefined,
        login: '',
        password: ''
      });
    }
  };

  const handleDeleteEquipment = (sectionId: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [sectionId]: (prev.equipment[sectionId] || []).filter((_, i) => i !== index)
      }
    }));
  };

  const handleInputChange = (id: string, value: string | string[] | Equipment[]) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [id]: value
      }
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const email = formData.clientInfo.responsiblePerson.email;
      const stationName = formData.clientInfo.serviceStationName || 'Нова станція';
      const fileName = `checklist-${stationName}-${new Date().toISOString().split('T')[0]}.html`;

      // Створюємо HTML контент
      const htmlContent = EmailService.createEmailContent(formData);

      // Зберігаємо файл
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Відправляємо email якщо вказана адреса
      if (email) {
        await EmailService.sendEmail({
          to: email,
          subject: `Чек-лист системи відеоспостереження - ${stationName}`,
          html: htmlContent,
        });
        alert('Чек-лист збережено та відправлено на email');
      } else {
        alert('Чек-лист збережено');
      }

      // Очищаємо форму
      setFormData(StorageService.loadFormData());
    } catch (error) {
      console.error('Помилка:', error);
      alert('Помилка: ' + (error instanceof Error ? error.message : 'Невідома помилка'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientInfoChange = (field: keyof ClientInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      clientInfo: {
        ...prev.clientInfo,
        [field]: value
      }
    }));
  };

  const handleResponsiblePersonChange = (field: keyof ClientInfo['responsiblePerson'], value: string) => {
    setFormData(prev => ({
      ...prev,
      clientInfo: {
        ...prev.clientInfo,
        responsiblePerson: {
          ...prev.clientInfo.responsiblePerson,
          [field]: value
        }
      }
    }));
  };

  const handleContractorChange = (field: keyof typeof formData.contractor, value: any) => {
    setFormData(prev => ({
      ...prev,
      contractor: {
        ...prev.contractor,
        [field]: value
      }
    }));
  };

  const renderClientInfo = () => (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-6">
        <Info size={24} className="text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-200">Інформація про клієнта</h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-1">Назва станції</label>
            <input
              type="text"
              value={formData.clientInfo.serviceStationName}
              onChange={(e) => handleClientInfoChange('serviceStationName', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded text-white"
              placeholder="Введіть назву станції"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Адреса</label>
            <input
              type="text"
              value={formData.clientInfo.serviceStationAddress}
              onChange={(e) => handleClientInfoChange('serviceStationAddress', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded text-white"
              placeholder="Введіть адресу"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-300">Відповідальна особа</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-1">ПІБ</label>
              <input
                type="text"
                value={formData.clientInfo.responsiblePerson.name}
                onChange={(e) => handleResponsiblePersonChange('name', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white"
                placeholder="Введіть ПІБ"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Телефон</label>
              <input
                type="tel"
                value={formData.clientInfo.responsiblePerson.phone}
                onChange={(e) => handleResponsiblePersonChange('phone', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white"
                placeholder="+380"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.clientInfo.responsiblePerson.email}
                onChange={(e) => handleResponsiblePersonChange('email', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Посада</label>
              <input
                type="text"
                value={formData.clientInfo.responsiblePerson.position}
                onChange={(e) => handleResponsiblePersonChange('position', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white"
                placeholder="Введіть посаду"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContractor = () => (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-6">
        <Info size={24} className="text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-200">Інформація про підрядника</h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-1">Назва компанії</label>
            <input
              type="text"
              value={formData.contractor.companyName}
              onChange={(e) => handleContractorChange('companyName', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded text-white"
              placeholder="Введіть назву компанії"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">ПІБ</label>
            <input
              type="text"
              value={formData.contractor.fullName}
              onChange={(e) => handleContractorChange('fullName', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded text-white"
              placeholder="Введіть ПІБ"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Телефон</label>
            <input
              type="tel"
              value={formData.contractor.phoneNumber}
              onChange={(e) => handleContractorChange('phoneNumber', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded text-white"
              placeholder="+380"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Зони обслуговування</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.contractor.serviceAreas.map((area, index) => (
                <span 
                  key={index}
                  className="bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => handleContractorChange(
                      'serviceAreas',
                      formData.contractor.serviceAreas.filter((_, i) => i !== index)
                    )}
                    className="hover:text-red-400 transition-colors"
                    title="Видалити"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                className="flex-1 p-2 bg-gray-700 rounded text-white"
                placeholder="Введіть нову зону"
              />
              <button
                type="button"
                onClick={() => {
                  if (newArea.trim()) {
                    handleContractorChange(
                      'serviceAreas',
                      [...formData.contractor.serviceAreas, newArea.trim()]
                    );
                    setNewArea('');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Додати
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEquipmentForm = (category: string) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 mb-1">Модель</label>
            <input
              type="text"
              value={newEquipment.model}
              onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded text-white"
              placeholder="Введіть модель"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Серійний номер</label>
            <input
              type="text"
              value={newEquipment.serialNumber || ''}
              onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded text-white"
              placeholder="Введіть серійний номер"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Кількість</label>
            <input
              type="number"
              value={newEquipment.quantity || 1}
              onChange={(e) => setNewEquipment({ ...newEquipment, quantity: parseInt(e.target.value) || 1 })}
              className="w-full p-2 bg-gray-700 rounded text-white"
              min="1"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Розташування</label>
            <input
              type="text"
              value={newEquipment.location || ''}
              onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded text-white"
              placeholder="Введіть розташування"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">IP адреса</label>
            <input
              type="text"
              value={newEquipment.ipAddress || ''}
              onChange={(e) => setNewEquipment({ ...newEquipment, ipAddress: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded text-white"
              placeholder="192.168.1.100"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Порт</label>
            <input
              type="number"
              value={newEquipment.port || ''}
              onChange={(e) => setNewEquipment({ ...newEquipment, port: parseInt(e.target.value) })}
              className="w-full p-2 bg-gray-700 rounded text-white"
              placeholder="80"
              min="1"
              max="65535"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Логін</label>
            <input
              type="text"
              value={newEquipment.login || ''}
              onChange={(e) => setNewEquipment({ ...newEquipment, login: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded text-white"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Пароль</label>
            <input
              type="password"
              value={newEquipment.password || ''}
              onChange={(e) => setNewEquipment({ ...newEquipment, password: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded text-white"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Статус</label>
            <select
              value={newEquipment.status}
              onChange={(e) => setNewEquipment({ ...newEquipment, status: e.target.value as 'active' | 'inactive' })}
              className="w-full p-2 bg-gray-700 rounded text-white"
            >
              <option value="active">Активний</option>
              <option value="inactive">Неактивний</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => handleAddEquipment(category)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
            disabled={!newEquipment.model}
          >
            <Plus size={18} />
            Додати обладнання
          </button>
        </div>
      </div>
    );
  };

  const renderQuestion = (question: Section['questions'][0], sectionId: string) => {
    switch (question.type) {
      case 'equipment':
        return (
          <div>
            <div className="space-y-2">
              {(formData.equipment[sectionId] || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'active' ? 'bg-green-500' :
                      item.status === 'maintenance' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <div className="flex flex-col">
                      <span className="text-gray-200">{item.model}</span>
                      <div className="text-sm text-gray-400">
                        {item.serialNumber && <span className="mr-3">S/N: {item.serialNumber}</span>}
                        {item.quantity && <span className="mr-3">Кількість: {item.quantity}</span>}
                        {item.location && <span className="mr-3">Розташування: {item.location}</span>}
                        {item.ipAddress && <span>IP: {item.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                      onClick={() => console.log('Show details:', item)}
                      title="Показати деталі"
                    >
                      <Info size={18} />
                    </button>
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1 rounded transition-colors"
                      onClick={() => handleDeleteEquipment(sectionId, index)}
                      title="Видалити обладнання"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {renderEquipmentForm(sectionId)}
          </div>
        );

      case 'yesno':
        return (
          <div className="flex gap-4">
            {['Так', 'Ні'].map(option => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData.answers[question.id] === option}
                  onChange={e => handleInputChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
                />
                <span className="text-gray-200">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'select':
        return (
          <select
            value={formData.answers[question.id] as string || ''}
            onChange={e => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 bg-gray-800 border-gray-700 rounded-md text-gray-200"
          >
            <option value="">Виберіть відповідь</option>
            {question.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="flex flex-col gap-2">
            {question.options?.map(option => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(formData.answers[question.id] as string[] || []).includes(option)}
                  onChange={e => {
                    const currentValues = formData.answers[question.id] as string[] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleInputChange(question.id, newValues);
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                />
                <span className="text-gray-200">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={formData.answers[question.id] as string || ''}
            onChange={e => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 bg-gray-800 border-gray-700 rounded-md text-gray-200"
            placeholder="Введіть відповідь"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={formData.answers[question.id] as string || ''}
            onChange={e => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 bg-gray-800 border-gray-700 rounded-md text-gray-200"
            placeholder="Введіть кількість"
            min="0"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={formData.answers[question.id] as string || ''}
            onChange={e => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 bg-gray-800 border-gray-700 rounded-md text-gray-200 h-32"
            placeholder="Введіть додаткову інформацію"
          />
        );
    }
  };

  const sections: Section[] = [
    {
      title: "Камери",
      icon: <Camera className="w-5 h-5" />,
      questions: [
        {
          id: "total_cameras",
          text: "Загальна кількість камер:",
          type: "number"
        },
        {
          id: "cameras",
          text: "Наявні камери",
          type: "equipment"
        },
        {
          id: "cameras_present",
          text: "Чи присутні всі заявлені камери?",
          type: "yesno"
        },
        {
          id: "cameras_positioned",
          text: "Чи встановлені камери у потрібних місцях для моніторингу?",
          type: "yesno"
        },
        {
          id: "camera_type",
          text: "Який тип камер використовується?",
          type: "multiselect",
          options: [
            "IP (RTSP, RTMP, ONVIF, HTTP)",
            "Аналогові (є пристрій для перетворення сигналу)",
            "Інше"
          ]
        },
        {
          id: "camera_ip_config",
          text: "Чи налаштовані камери на статичні IP-адреси чи використовують DHCP?",
          type: "select",
          options: [
            "Статичні IP",
            "DHCP",
            "Не визначено"
          ]
        },
        {
          id: "camera_web_access",
          text: "Чи доступні камери через веб-інтерфейс для первинної перевірки?",
          type: "yesno"
        },
        {
          id: "camera_physical_condition",
          text: "Чи немає фізичних пошкоджень камер та чи чистий об'єктив?",
          type: "yesno"
        },
        {
          id: "camera_power_network",
          text: "Чи підключені камери до живлення та мережі?",
          type: "yesno"
        }
      ]
    },
    {
      title: "Реєстратори",
      icon: <HardDrive className="w-5 h-5" />,
      questions: [
        {
          id: "dvr_equipment",
          text: "Наявні реєстратори",
          type: "equipment",
          equipment: [
            { model: "Hikvision DS-7716NI-K4", status: 'active' },
            { model: "Dahua NVR4216-16P-4KS2", status: 'active' }
          ]
        },
        {
          id: "dvr_present",
          text: "Чи встановлений та фізично підключений реєстратор?",
          type: "yesno"
        },
        {
          id: "dvr_type",
          text: "Який тип реєстратора використовується?",
          type: "select",
          options: [
            "Підтримує IP-камери",
            "Аналоговий",
            "Інше"
          ]
        },
        {
          id: "dvr_channels",
          text: "Чи має реєстратор достатню кількість каналів для всіх камер?",
          type: "yesno"
        },
        {
          id: "dvr_condition",
          text: "Чи немає фізичних пошкоджень у реєстраторі?",
          type: "yesno"
        },
        {
          id: "dvr_working",
          text: "Чи увімкнений реєстратор та чи працює належним чином?",
          type: "yesno"
        },
        {
          id: "dvr_recording",
          text: "Чи налаштований реєстратор для безперервного запису та моніторингу?",
          type: "yesno"
        },
        {
          id: "dvr_remote_access",
          text: "Чи доступний реєстратор через мережу для дистанційного управління?",
          type: "yesno"
        }
      ]
    },
    {
      title: "Мережа",
      icon: <Network className="w-5 h-5" />,
      questions: [
        {
          id: "network_equipment",
          text: "Мережеве обладнання",
          type: "equipment",
          equipment: [
            { model: "Ubiquiti UniFi Switch PRO 24 PoE", status: 'active' },
            { model: "Mikrotik CRS326-24G-2S+RM", status: 'active' }
          ]
        },
        {
          id: "network_cable",
          text: "Чи використовується Ethernet-кабель категорії Cat5e або вище?",
          type: "yesno"
        },
        {
          id: "network_cable_condition",
          text: "Чи перевірено, що кабелі не пошкоджені та правильно підключені?",
          type: "yesno"
        },
        {
          id: "wifi_signal",
          text: "Якщо використовуються Wi-Fi камери – чи стабільний сигнал (бажано 5 ГГц)?",
          type: "yesno"
        },
        {
          id: "internet_speed",
          text: "Яка швидкість інтернету (Мбіт/с)?",
          type: "select",
          options: [
            "Менше 50",
            "50-100",
            "Більше 100"
          ]
        },
        {
          id: "network_load",
          text: "Чи не перевантажена мережа іншими пристроями?",
          type: "yesno"
        }
      ]
    },
    {
      title: "Роутер",
      icon: <Router className="w-5 h-5" />,
      questions: [
        {
          id: "router_present",
          text: "Чи встановлений та підключений роутер?",
          type: "yesno"
        },
        {
          id: "router_gigabit",
          text: "Чи підтримує роутер Gigabit Ethernet?",
          type: "yesno"
        },
        {
          id: "router_qos",
          text: "Чи є в роутері функція QoS для пріоритезації відеопотоків?",
          type: "yesno"
        },
        {
          id: "router_model",
          text: "Введіть модель роутера (якщо є):",
          type: "text"
        },
        {
          id: "router_condition",
          text: "Чи немає фізичних пошкоджень у роутері?",
          type: "yesno"
        },
        {
          id: "router_working",
          text: "Чи увімкнений та працює роутер?",
          type: "yesno"
        },
        {
          id: "router_network_settings",
          text: "Чи правильно налаштовані мережеві параметри?",
          type: "yesno"
        },
        {
          id: "router_ports",
          text: "Чи відкриті порти 80 (HTTP) та 554 (RTSP) для камер?",
          type: "yesno"
        }
      ]
    },
    {
      title: "Живлення",
      icon: <Zap className="w-5 h-5" />,
      questions: [
        {
          id: "power_devices",
          text: "Чи всі пристрої (камери, реєстратор, комп'ютер/сервер) підключені до живлення?",
          type: "yesno"
        },
        {
          id: "power_ups",
          text: "Чи є джерело безперебійного живлення (ДБЖ) для основного обладнання?",
          type: "yesno"
        },
        {
          id: "power_stability",
          text: "Чи стабільне живлення, без перебоїв?",
          type: "yesno"
        }
      ]
    },
    {
      title: "Безпека",
      icon: <Lock className="w-5 h-5" />,
      questions: [
        {
          id: "security_passwords",
          text: "Чи змінені стандартні паролі на камерах, реєстраторі та роутері?",
          type: "yesno"
        },
        {
          id: "security_vpn",
          text: "Чи налаштований VPN для забезпечення безпечного віддаленого доступу до системи?",
          type: "yesno"
        }
      ]
    },
    {
      title: "Додаткові кроки",
      icon: <PlayCircle className="w-5 h-5" />,
      questions: [
        {
          id: "connection_ping",
          text: "Чи виконано ping на IP-адреси камер та реєстратора для перевірки зв'язку?",
          type: "yesno"
        },
        {
          id: "web_interfaces",
          text: "Чи доступні веб-інтерфейси камер та реєстратора?",
          type: "yesno"
        },
        {
          id: "monitoring_active",
          text: "Чи запущено моніторинг у реальному часі?",
          type: "yesno"
        },
        {
          id: "recording_quality",
          text: "Чи перевірено, що запис працює без пропусків і відповідає заявленій якості?",
          type: "yesno"
        }
      ]
    },
    {
      title: "Підсумок та коментарі",
      icon: <FileText className="w-5 h-5" />,
      questions: [
        {
          id: "additional_notes",
          text: "Примітки / Додаткова інформація:",
          type: "textarea"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Чек-лист системи відеоспостереження</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {renderClientInfo()}
        {renderContractor()}
        
        {sections.map(section => (
          <div key={section.title} className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              {section.icon}
              <h2 className="text-xl font-semibold text-gray-200">{section.title}</h2>
            </div>
            <div className="space-y-6">
              {section.questions.map(question => (
                <div key={question.id} className="space-y-2">
                  <label className="block text-gray-300">{question.text}</label>
                  {renderQuestion(question, section.title.toLowerCase())}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            disabled={isSubmitting}
          >
            <Check size={18} />
            Зберегти та експортувати
          </button>
        </div>
      </form>

      <SavedForms />
    </div>
  );
}

export default App;
