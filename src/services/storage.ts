import { FormData } from '../types';

const STORAGE_KEY = 'checklist_form_data';
const SAVED_FORMS_KEY = 'checklist_saved_forms';

/**
 * Сервіс для роботи з локальним сховищем
 */
export const StorageService = {
  /**
   * Завантажити дані форми з локального сховища
   */
  loadFormData: (): FormData => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Помилка при завантаженні даних:', error);
    }
    
    return {
      clientInfo: {
        serviceStationName: '',
        serviceStationAddress: '',
        responsiblePerson: {
          name: '',
          phone: '',
          email: '',
          position: ''
        },
        itResponsible: {
          name: '',
          phone: '',
          email: '',
          position: ''
        }
      },
      contractor: {
        companyName: '',
        fullName: '',
        phoneNumber: '',
        contactPerson: {
          name: '',
          phone: '',
          email: '',
          position: ''
        },
        serviceAreas: []
      },
      equipment: {
        "камери": [],
        "реєстратори": [],
        "мережа": [],
        "роутер": [],
        "живлення": []
      },
      answers: {}
    };
  },

  /**
   * Зберегти дані форми в локальне сховище
   */
  saveFormData: (data: FormData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Помилка при збереженні даних:', error);
    }
  },

  /**
   * Зберегти заповнену форму в архів
   */
  saveCompletedForm: (formData: FormData, emailContent: string): void => {
    try {
      const savedForms = StorageService.getSavedForms();
      const newForm = {
        timestamp: new Date().toISOString(),
        formData,
        emailContent
      };
      savedForms.push(newForm);
      localStorage.setItem(SAVED_FORMS_KEY, JSON.stringify(savedForms));
    } catch (error) {
      console.error('Помилка при збереженні заповненої форми:', error);
      throw new Error('Не вдалося зберегти форму');
    }
  },

  /**
   * Отримати всі збережені форми
   */
  getSavedForms: () => {
    try {
      const savedForms = localStorage.getItem(SAVED_FORMS_KEY);
      return savedForms ? JSON.parse(savedForms) : [];
    } catch (error) {
      console.error('Помилка при отриманні збережених форм:', error);
      return [];
    }
  },

  /**
   * Очистити поточну форму
   */
  clearCurrentForm: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Помилка при очищенні форми:', error);
    }
  }
};
