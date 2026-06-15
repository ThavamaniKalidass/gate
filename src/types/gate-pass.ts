export type GatePassType = "Returnable" | "Non Returnable";
export type Department = "IT" | "MEDICAL CODING" | "MEDICAL BILLING" | "CHARGE TEAM" | "AR CALLER";
export type GatePassStatus = "Draft" | "Printed" | "Approved";

export interface GatePassItem {
  id: string;
  serialNumber: string;
  brand: string;
  deviceType: string;
  quantity: number;
  remarks: string;
}

export interface ApprovalDetails {
  preparedByName: string;
  preparedByDepartment: Department | "";
  securityInCharge: string;
  receiverName: string;
  receiverPhone: string;
  receiverSignature?: string;
}

export interface GatePass {
  id: string;
  gatePassType: GatePassType;
  gatePassNumber: string;
  employeeName: string;
  employeeId: string;
  department: Department | "";
  date: string;
  preparedTime: string;
  fromLocation: string;
  toLocation: string;
  items: GatePassItem[];
  approvals: ApprovalDetails;
  qrCode?: string;
  status: GatePassStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettings {
  companyName: string;
  address: string;
  publicUrl?: string;
  logo?: string;
  authorizedSignature?: string;
}

export const departments: Department[] = ["IT", "MEDICAL CODING", "MEDICAL BILLING", "CHARGE TEAM", "AR CALLER"];
export const deviceTypes = ["Monitor", "Mouse", "Keyboard", "Thin Client", "Convertor", "Cable", "Adapter"] as const;
export const brandOptions = ["HP", "DELL", "LENEVO", "CLIENTRONIX", "BENQ", "SAMSUNG", "LOGITECH", "ACER"] as const;
export const fixedCompanyAddressTitle = "Vishranthi Melaram Towers";
export const fixedCompanyAddress = `${fixedCompanyAddressTitle}, No. 2/319, 5th Floor, Rajiv Gandhi Salai (OMR), Karapakkam, Chennai - 600 097`;
