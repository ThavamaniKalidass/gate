import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

export async function exportElementToPdf(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Preview element is not available for export.");
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    width: A4_WIDTH_PX,
    height: A4_HEIGHT_PX,
    windowWidth: A4_WIDTH_PX,
    windowHeight: A4_HEIGHT_PX,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    onclone: (documentClone) => {
      const clonedElement = documentClone.getElementById(elementId);
      if (clonedElement) {
        sanitizePdfClone(clonedElement);
      }
    },
  });
  if (!canvas.width || !canvas.height) {
    throw new Error("PDF preview could not be rendered.");
  }

  const image = canvas.toDataURL("image/png", 1);
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(image, "PNG", 0, 0, pageWidth, pageHeight);
  pdf.save(sanitizePdfFileName(fileName));
}

function sanitizePdfFileName(fileName: string) {
  const cleanedName = fileName
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .replace(/[. -]+$/, "");

  return `${cleanedName || "gate-pass"}.pdf`.replace(/\.pdf\.pdf$/i, ".pdf");
}

function sanitizePdfClone(root: HTMLElement) {
  root.classList.add("pdf-export");
  root.style.width = `${A4_WIDTH_PX}px`;
  root.style.height = `${A4_HEIGHT_PX}px`;
  root.style.minHeight = `${A4_HEIGHT_PX}px`;
  root.style.maxWidth = `${A4_WIDTH_PX}px`;
  root.style.backgroundColor = "#ffffff";
  root.style.color = "#17211c";
  root.style.borderColor = "#d8e0da";
  root.style.boxShadow = "none";
  root.style.borderRadius = "0";
  root.style.padding = "28px";
  root.style.overflow = "hidden";

  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
  elements.forEach((element) => {
    element.style.color = "#17211c";
    element.style.borderColor = "#cbd5e1";
    element.style.outlineColor = "transparent";
    element.style.textDecorationColor = "currentColor";
    element.style.boxShadow = "none";
    element.style.backgroundImage = "none";

    element.style.backgroundColor = "transparent";

    if (element.tagName === "TH" || element.className.toString().includes("bg-[#0f5132]")) {
      element.style.backgroundColor = "#0f5132";
      element.style.color = "#ffffff";
      element.style.borderColor = "#0f5132";
    } else if (element.id === "gate-pass-preview") {
      element.style.backgroundColor = "#ffffff";
    } else if (element.className.toString().includes("bg-emerald")) {
      element.style.backgroundColor = "#eef8f2";
    } else if (element.className.toString().includes("bg-white")) {
      element.style.backgroundColor = "#ffffff";
    }

    if (element.className.toString().includes("border-[#0f5132]")) {
      element.style.borderColor = "#0f5132";
    } else if (element.className.toString().includes("text-[#0f5132]")) {
      element.style.color = "#0f5132";
    } else if (element.className.toString().includes("text-white")) {
      element.style.color = "#ffffff";
    }
  });

  applyA4Layout(root);
}

function applyA4Layout(root: HTMLElement) {
  const header = root.querySelector<HTMLElement>(".pdf-header");
  header?.style.setProperty("display", "flex");
  header?.style.setProperty("flex-direction", "row");
  header?.style.setProperty("align-items", "flex-start");
  header?.style.setProperty("justify-content", "space-between");
  header?.style.setProperty("gap", "18px");
  header?.style.setProperty("padding-bottom", "16px");

  const brand = root.querySelector<HTMLElement>(".pdf-brand");
  brand?.style.setProperty("display", "flex");
  brand?.style.setProperty("flex-direction", "row");
  brand?.style.setProperty("align-items", "center");
  brand?.style.setProperty("gap", "14px");
  brand?.style.setProperty("min-width", "0");
  brand?.style.setProperty("flex", "1 1 auto");

  const logo = root.querySelector<HTMLElement>(".pdf-logo");
  logo?.style.setProperty("width", "190px");
  logo?.style.setProperty("height", "66px");
  logo?.style.setProperty("flex", "0 0 190px");
  logo?.style.setProperty("padding", "8px");

  const copy = root.querySelector<HTMLElement>(".pdf-brand-copy");
  copy?.style.setProperty("min-width", "0");
  copy?.style.setProperty("max-width", "420px");

  const qr = root.querySelector<HTMLElement>(".pdf-qr");
  qr?.style.setProperty("width", "78px");
  qr?.style.setProperty("height", "78px");
  qr?.style.setProperty("flex", "0 0 78px");
  qr?.style.setProperty("align-self", "flex-start");

  const employeeRow = root.querySelector<HTMLElement>(".pdf-employee-row");
  employeeRow?.style.setProperty("display", "grid");
  employeeRow?.style.setProperty("grid-template-columns", "repeat(3, minmax(0, 1fr))");

  const bottomRow = root.querySelector<HTMLElement>(".pdf-bottom-row");
  bottomRow?.style.setProperty("display", "flex");
  bottomRow?.style.setProperty("flex-direction", "row");
  bottomRow?.style.setProperty("align-items", "flex-end");
  bottomRow?.style.setProperty("justify-content", "space-between");
}
