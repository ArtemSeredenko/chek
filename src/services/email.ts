import { FormData } from '../types';

/**
 * Інтерфейс для даних email
 */
export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

/**
 * Сервіс для роботи з email
 */
export class EmailService {
  /**
   * Створити HTML контент для відправки на email
   */
  static createEmailContent(formData: FormData): string {
    return `
      <h2>Чек-лист системи відеоспостереження</h2>
      
      <h3>Інформація про клієнта</h3>
      <p>Назва станції: ${formData.clientInfo.serviceStationName}</p>
      <p>Адреса: ${formData.clientInfo.serviceStationAddress}</p>
      
      <h4>Відповідальна особа</h4>
      <p>ПІБ: ${formData.clientInfo.responsiblePerson.name}</p>
      <p>Телефон: ${formData.clientInfo.responsiblePerson.phone}</p>
      <p>Email: ${formData.clientInfo.responsiblePerson.email}</p>
      <p>Посада: ${formData.clientInfo.responsiblePerson.position}</p>
      
      <h3>Інформація про підрядника</h3>
      <p>Компанія: ${formData.contractor.companyName}</p>
      <p>ПІБ: ${formData.contractor.fullName}</p>
      <p>Телефон: ${formData.contractor.phoneNumber}</p>
      <p>Зони обслуговування: ${formData.contractor.serviceAreas.join(', ')}</p>
      
      <h3>Обладнання</h3>
      ${Object.entries(formData.equipment)
        .map(([category, items]) => `
          <h4>${category}</h4>
          <ul>
            ${items.map(item => `
              <li>
                <strong>Модель:</strong> ${item.model}<br>
                ${item.serialNumber ? `<strong>Серійний номер:</strong> ${item.serialNumber}<br>` : ''}
                ${item.quantity ? `<strong>Кількість:</strong> ${item.quantity}<br>` : ''}
                ${item.location ? `<strong>Розташування:</strong> ${item.location}<br>` : ''}
                ${item.ipAddress ? `<strong>IP адреса:</strong> ${item.ipAddress}<br>` : ''}
                ${item.port ? `<strong>Порт:</strong> ${item.port}<br>` : ''}
                ${item.login ? `<strong>Логін:</strong> ${item.login}<br>` : ''}
                <strong>Статус:</strong> ${item.status === 'active' ? 'Активний' : 'Неактивний'}
              </li>
            `).join('')}
          </ul>
        `).join('')}
      
      <h3>Відповіді на запитання</h3>
      ${Object.entries(formData.answers)
        .map(([key, value]) => `
          <p><strong>${key}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</p>
        `).join('')}
    `;
  }

  /**
   * Відправити email
   */
  static async sendEmail(data: EmailData): Promise<void> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
