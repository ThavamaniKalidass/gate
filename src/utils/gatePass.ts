import { format } from "date-fns";
import QRCode from "qrcode";
import type { CompanySettings, GatePass, GatePassItem } from "../types/gate-pass";

export const emptyItem = (): GatePassItem => ({
  id: crypto.randomUUID(),
  serialNumber: "",
  brand: "",
  deviceType: "",
  quantity: 1,
  remarks: "",
});

export function generateGatePassNumber(sequence: number, date = new Date()) {
  return `GP/${format(date, "yyyy/MM")}/${String(sequence).padStart(4, "0")}`;
}

export interface SharedGatePassPayload {
  version: 1;
  pass: Partial<GatePass>;
  settings: Pick<CompanySettings, "companyName" | "address" | "logo">;
}

function getBaseShareUrl(settings: CompanySettings) {
  const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  return isLocalhost && settings.publicUrl ? settings.publicUrl.trim().replace(/\/$/, "") : window.location.origin;
}

function getShareableGatePassUrl(pass: Partial<GatePass>, settings: CompanySettings) {
  const { qrCode: _qrCode, approvals, ...shareablePass } = pass;
  const { receiverSignature: _receiverSignature, ...shareableApprovals } = approvals ?? {};
  const payload: SharedGatePassPayload = {
    version: 1,
    pass: {
      ...shareablePass,
      approvals: approvals ? (shareableApprovals as GatePass["approvals"]) : undefined,
    },
    settings: {
      companyName: settings.companyName,
      address: settings.address,
      logo: settings.logo?.startsWith("/") ? settings.logo : "/smb-logo.png",
    },
  };

  const baseUrl = getBaseShareUrl(settings);
  return `${baseUrl}/shared#pass=${encodePayload(payload)}`;
}

function getGatePassUrl(passId: string, settings: CompanySettings) {
  const baseUrl = getBaseShareUrl(settings);
  return `${baseUrl}/shared?passId=${encodeURIComponent(passId)}`;
}

export function getQrPayload(pass: Partial<GatePass>, settings: CompanySettings) {
  if (pass.id) {
    return getGatePassUrl(pass.id, settings);
  }

  return getShareableGatePassUrl(pass, settings);
}

export async function generateGatePassQrCode(pass: Partial<GatePass>, settings: CompanySettings) {
  const payloadUrl = getQrPayload(pass, settings);
  return QRCode.toDataURL(payloadUrl, {
    width: 320,
    margin: 2,
    color: { dark: "#0f5132", light: "#ffffff" },
  });
}

export function readSharedGatePass(hash: string): SharedGatePassPayload | undefined {
  const encoded = new URLSearchParams(hash.replace(/^#/, "")).get("pass");
  if (!encoded) return undefined;

  try {
    const payload = JSON.parse(decodePayload(encoded)) as SharedGatePassPayload;
    return payload.version === 1 ? payload : undefined;
  } catch {
    return undefined;
  }
}

function encodePayload(value: SharedGatePassPayload) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodePayload(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}
