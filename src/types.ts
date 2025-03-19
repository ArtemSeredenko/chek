export interface Equipment {
  model: string;
  serialNumber?: string;
  status: 'active' | 'inactive';
  quantity?: number;
  location?: string;
  ipAddress?: string;
  login?: string;
  password?: string;
  port?: number;
};

export type ClientInfo = {
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

export type ContractorInfo = {
  companyName: string;
  contactPerson: {
    name: string;
    phone: string;
    email: string;
    position: string;
  };
  serviceAreas: string[];
  fullName: string;
  phoneNumber: string;
};

export type FormData = {
  clientInfo: ClientInfo;
  contractor: ContractorInfo;
  equipment: Record<string, Equipment[]>;
  answers: Record<string, string | string[] | Equipment[]>;
};