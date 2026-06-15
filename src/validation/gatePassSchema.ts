import { z } from "zod";
import { departments } from "../types/gate-pass";

export const gatePassSchema = z.object({
  gatePassType: z.enum(["Returnable", "Non Returnable"]),
  gatePassNumber: z.string().min(1, "Gate pass number is required"),
  employeeName: z.string().min(2, "Employee name is required"),
  employeeId: z.string().regex(/^\d+$/, "Employee ID must be numeric"),
  department: z.enum(departments, "Department is required"),
  date: z.string().min(1, "Date is required"),
  preparedTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Prepared time must be 24-hour HH:mm"),
  fromLocation: z.string().min(2, "From location is required"),
  toLocation: z.string().min(2, "To location is required"),
  items: z
    .array(
      z.object({
        id: z.string(),
        serialNumber: z.string().min(1, "Serial number is required"),
        brand: z.string().min(1, "Brand is required"),
        deviceType: z.string().min(1, "Device type is required"),
        quantity: z.number().int().positive("Quantity must be positive"),
        remarks: z.string(),
      }),
    )
    .min(1, "At least one item is required"),
  approvals: z.object({
    preparedByName: z.string().min(2, "Prepared by is required"),
    preparedByDepartment: z.literal("IT", "Prepared department must be IT"),
    securityInCharge: z.string().min(2, "Security in charge is required"),
    receiverName: z.string().min(2, "Receiver name is required"),
    receiverPhone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
    receiverSignature: z.string().optional(),
  }),
});

export type GatePassFormValues = z.infer<typeof gatePassSchema>;
