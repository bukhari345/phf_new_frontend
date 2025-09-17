'use client';

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
  docId: string;
  docName: string;
  variant?: 'scheme1' | 'scheme2' | 'scheme3';
  instructions?: string[];
  accept?: string;
  exImages?: { src: string; label: string }[];
};

type Bilingual = { en: string; ur: string };

type ExampleInfo = {
  steps: Bilingual[];
  tips?: Bilingual[];
  exImages?: { src: string; label: string }[];
  accept?: string;
};

const palette = {
  scheme1: {
    header: 'from-green-50 to-emerald-50',
    title: 'text-green-900',
    sub: 'text-green-700',
    button: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
    infoBox: 'bg-green-50 border-green-200 text-green-800',
  },
  scheme2: {
    header: 'from-green-50 to-green-50',
    title: 'text-green-900',
    sub: 'text-green-700',
    button: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
    infoBox: 'bg-green-50 border-green-200 text-green-800',
  },
  scheme3: {
    header: 'from-green-50 to-fuchsia-50',
    title: 'text-green-900',
    sub: 'text-green-700',
    button: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
    infoBox: 'bg-green-50 border-green-200 text-green-800',
  },
} as const;

type ExamplesMap = Record<string, ExampleInfo>;

const examples: ExamplesMap = {
  cnic: {
    steps: [
      { en: 'Merge CNIC front and back into a single PDF.', ur: 'CNIC کے فرنٹ اور بیک کو ایک ہی PDF میں شامل کریں۔' },
      { en: 'Use a scanner app (Adobe Scan, Microsoft Lens) in "Document" mode.', ur: 'اسکینر ایپ (Adobe Scan، Microsoft Lens) میں "Document" موڈ استعمال کریں۔' },
      { en: 'Crop edges and avoid glare; text must be readable.', ur: 'کناروں کو درست طریقے سے کاٹیں اور چمک سے بچیں؛ متن واضح پڑھنے کے قابل ہو۔' },
      { en: 'Name the file like: your-name_CNIC.pdf  Example: (Anwar Ali Cnic.pdf)', ur: 'فائل کا نام اس طرز پر رکھیں:آپ کا نام.pdf-CNIC  مثال: (Anwar Ali Cnic.pdf)' },
   
    ],
    tips: [
      { en: 'Include both front and back pages.', ur: 'فرنٹ اور بیک دونوں صفحات شامل کریں۔' },
      { en: 'Use flat lighting to avoid shadows/glare.', ur: 'سائے/چمک سے بچنے کیلئے یکساں روشنی استعمال کریں۔' },
      { en: 'Keep the PDF under 10MB.', ur: 'PDF سائز 10MB سے کم رکھیں۔' },
    ],
    exImages: [
      { src: '/frontCnic.png', label: 'CNIC Front (example)' },
      { src: '/backCnic.png', label: 'CNIC Back (example)' },
    ],
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  domicile: {
    steps: [
      { en: 'Scan the domicile certificate clearly.', ur: 'ڈومیسائل سرٹیفکیٹ صاف طور پر اسکین کریں۔' },
      { en: 'If multiple pages, merge them into a single PDF.', ur: 'اگر صفحات زیادہ ہیں تو انہیں ایک PDF میں شامل کریں۔' },
      { en: 'Name the file like: your-name_domicile.pdf  Example: (Anwar Ali domicile.pdf)', ur: 'فائل کا نام اس طرز پر رکھیں:آپ کا نام.pdf-domicile  مثال: (Anwar Ali domicile.pdf)' },
    ],
    tips: [
      { en: 'Stamp and text must be clearly visible.', ur: 'مہر اور متن واضح نظر آئیں۔' },
      { en: 'Keep the PDF under 10MB.', ur: 'PDF سائز 10MB سے کم رکھیں۔' },
    ],
    exImages: [{ src: '/domicle.jpg', label: 'Domicile (example)' }],
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  passport: {
    steps: [
      { en: 'Upload two recent passport-size photographs.', ur: 'دو حالیہ پاسپورٹ سائز تصاویر اپ لوڈ کریں۔' },
      { en: 'Background should be plain; face clearly visible.', ur: 'پس منظر سادہ ہو، چہرہ واضح نظر آئے۔' },
      { en: 'Only image types (JPG/PNG/PDF) are allowed.', ur: 'صرف تصویر کی اقسام (JPG/PNG/PDF) قابل قبول ہیں۔' },
    ],
    tips: [
      { en: 'Recommended size 50KB–2MB.', ur: 'سفارش کردہ سائز 50KB تا 2MB۔' },
      { en: 'Do not use filters.', ur: 'فلٹرز استعمال نہ کریں۔' },
    ],
    exImages: [{ src: '/WhatsApp Image 2025-09-04 at 13.42.07_c3ad71cf.jpg', label: 'Photo (example)' }],
    accept: '.jpg,.jpeg,.png,.pdf',
  },
  medical: {
    steps: [
      { en: 'Scan the attested medical degree/diploma and make a PDF.', ur: 'تصدیق شدہ میڈیکل ڈگری/ڈپلومہ اسکین کر کے PDF بنائیں۔' },
      { en: 'If multiple pages, merge into a single PDF.', ur: 'اگر صفحات زیادہ ہیں تو ایک PDF میں شامل کریں۔' },
      { en: 'Name the file like: your-name_Medical Qualification.pdf  Example: (Anwar Ali Medical Qualification.pdf)', ur: 'فائل کا نام اس طرز پر رکھیں:آپ کا نام.pdf-Medical Qualification  مثال: (Anwar Ali Medical Qualification.pdf)' },
    ],
    tips: [
      { en: 'Stamp and signatures must be clear.', ur: 'مہر اور دستخط واضح ہوں۔' },
      { en: 'Keep the PDF under 10MB.', ur: 'PDF سائز 10MB سے کم رکھیں۔' },
    ],
    exImages: [{ src: '/Medical Qualification.jpg', label: 'Degree (example)' }],
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  registration: {
    steps: [
      { en: 'Scan the registration certificate from PMC/PHCI/NCH/PPC or relevant council.', ur: 'PMC/PHCI/NCH/PPC یا متعلقہ کونسل کا رجسٹریشن سرٹیفکیٹ اسکین کریں۔' },
      { en: 'Name the file like: your-name_registration certificate.pdf  Example: (Anwar Ali registration certificate.pdf)', ur: 'فائل کا نام اس طرز پر رکھیں:آپ کا نام.pdf-registration certificate  مثال: (Anwar Ali registration certificate.pdf)' },

    ],
    tips: [
      { en: 'Show validity/expiry date clearly.', ur: 'تاریخ اجراء/تاریخ خاتمہ کی تاریخ واضح نظر آئے۔' },
      { en: 'Keep the PDF under 10MB.', ur: 'PDF سائز 10MB سے کم رکھیں۔' },
    ],
    exImages: [{ src: '/Registration Certificate.jpg', label: 'Registration (example)' }],
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  project: {
    steps: [
      { en: 'Combine the detailed project proposal and equipment quotations into a single PDF.', ur: 'تفصیلی پروجیکٹ پروپوزل اور آلات کی قیمتوں کو ایک ہی PDF میں جمع کریں۔' },
      { en: 'Name the file like: your-name_proposal.pdf  Example: (Anwar Aliproposal.pdf)', ur: 'فائل کا نام اس طرز پر رکھیں:آپ کا نام.pdf-proposal  مثال: (Anwar Ali proposal.pdf)' },
    ],
    tips: [
      { en: 'Headings readable; total amount clearly shown.', ur: 'سرخیاں واضح ہوں؛ کل رقم نمایاں درج ہو۔' },
      { en: 'PDF format is preferred.', ur: 'PDF فارمیٹ ترجیح دی جاتی ہے۔' },
    ],
    exImages: [{ src: '/prosal.png', label: 'Proposal (example)' }],
    accept: '.pdf,.doc,.docx',
  },
  'clinic-agreement': {
    steps: [
      { en: 'Scan the clinic ownership or rental agreement.', ur: 'کلینک کی ملکیتی یا کرایہ داری معاہدہ اسکین کریں۔' },
      { en: 'If many pages, merge into a single PDF.', ur: 'اگر صفحات زیادہ ہوں تو ایک PDF میں شامل کریں۔' },
      { en: 'Name the file like: your-name_clinic-agreement.pdf  Example: (Anwar Ali clinic-agreement.pdf)', ur: 'فائل کا نام اس طرز پر رکھیں:آپ کا نام.pdf-clinic-agreement  مثال: (Anwar Ali clinic-agreement.pdf)' },    ],
    tips: [
      { en: 'Stamps and signatures must be visible.', ur: 'مہر اور دستخط واضح نظر آئیں۔' },
      { en: 'Keep the PDF under 10MB.', ur: 'PDF سائز 10MB سے کم رکھیں۔' },
    ],
    exImages: [{ src: '/Registration Certificate.jpg', label: 'Agreement (example)' }],
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  'phc-license': {
    steps: [
      { en: 'Upload a clear scan of the Punjab Health Commission / Drug Regulatory Authority license.', ur: 'پنجاب ہیلتھ کمیشن/ڈرگ ریگولیٹری اتھارٹی کا لائسنس واضح طور پر اسکین کر کے اپ لوڈ کریں۔' },
      { en: 'Name the file like: your-name_phc-license.pdf  Example: (Anwar Ali phc-license.pdf)', ur: 'فائل کا نام اس طرز پر رکھیں:آپ کا نام.pdf-phc-license  مثال: (Anwar Ali phc-license.pdf)' },
    ],
    tips: [
      { en: 'License number should be visible.', ur: 'لائسنس نمبر واضح نظر آئے۔' },
      { en: 'Keep the PDF under 10MB.', ur: 'PDF سائز 10MB سے کم رکھیں۔' },
    ],
    exImages: [{ src: '/Registration Certificate.jpg', label: 'PHC License (example)' }],
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  unemployment: {
    steps: [
      { en: 'Scan the notarized Unemployment Affidavit and make a PDF.', ur: 'نوٹرائزڈ بیروزگاری حلف نامہ اسکین کر کے PDF بنائیں۔' },
      { en: 'Name the file like: your-name_ unemployment.pdf  Example: (Anwar Ali  unemployment.pdf)', ur: 'فائل کا نام اس طرز پر رکھیں:آپ کا نام.pdf- unemployment  مثال: (Anwar Ali  unemployment.pdf)' },    ],
  
    tips: [
      { en: 'Stamp and signature must be clear.', ur: 'مہر اور دستخط واضح ہوں۔' },
      { en: 'Keep the PDF under 10MB.', ur: 'PDF سائز 10MB سے کم رکھیں۔' },
    ],
    exImages: [{ src: '/affidavit.jpg', label: 'Affidavit (example)' }],
    accept: '.pdf,.jpg,.jpeg,.png',
  },
};

const defaultInfo: ExampleInfo = {
  steps: [
    { en: 'Scan the document clearly.', ur: 'دستاویز کو واضح طور پر اسکین کریں۔' },
    { en: 'Prefer PDF format.', ur: 'PDF فارمیٹ ترجیح دیں۔' },
    { en: 'Keep the file under 10MB.', ur: 'فائل کا سائز 10MB سے کم رکھیں۔' },
  ],
  tips: [{ en: 'Avoid blur/glare; text must be readable.', ur: 'دھندلاہٹ/چمک سے بچیں؛ متن قابل مطالعہ ہو۔' }],
  accept: '.pdf,.jpg,.jpeg,.png',
};

const UploadInstructionsModal: React.FC<Props> = ({
  open,
  onClose,
  onProceed,
  docId,
  docName,
  variant = 'scheme1',
  instructions,
  accept,
  exImages,
}) => {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const theme = palette[variant] ?? palette.scheme1;
  const base = examples[docId] ?? defaultInfo;

  const steps =
    instructions && instructions.length
      ? instructions.map((en, i) => ({ en, ur: base.steps?.[i]?.ur ?? en }))
      : base.steps;

  const tips = base.tips;
  const accepted = accept || base.accept || defaultInfo.accept;
  const images = exImages ?? base.exImages;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" aria-modal="true" role="dialog" aria-labelledby="upload-modal-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close modal overlay" role="button" tabIndex={-1} />
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-green-200 flex flex-col max-h-[82vh] mx-4" onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r ${theme.header} rounded-t-2xl`}>
          <div>
            <h3 id="upload-modal-title" className={`text-xl font-semibold ${theme.title}`}>How to upload: {docName}</h3>
            <p className={`text-md ${theme.sub}`}>Follow the steps below, then press Start Upload.</p>
            <p className={`text-md ${theme.sub} mt-1`} dir="rtl">اپ لوڈ کرنے کا طریقہ: {docName}</p>
            <p className={`text-md ${theme.sub}`} dir="rtl">نیچے دیئے گئے مراحل پر عمل کریں، پھر Start Upload دبائیں۔</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 rounded-lg px-3 py-1" aria-label="Close">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Steps</h4>
            <p className="text-xs text-gray-600 -mt-1 mb-2" dir="rtl">مراحل</p>
            <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-700">
              {steps.map((s, i) => (
                <li key={i}>
                  <div className="leading-snug">{s.en}</div>
                  <div className="leading-snug mt-0.5 text-gray-800" dir="rtl">{s.ur}</div>
                </li>
              ))}
            </ol>
          </div>

          {tips && tips.length > 0 && (
            <div className={`${theme.infoBox} border rounded-lg p-3`}>
              <h4 className="text-md font-semibold mb-1">Tips</h4>
              <p className="text-xs -mt-1 mb-2" dir="rtl">رہنمائی</p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {tips.map((t, i) => (
                  <li key={i}>
                    <div className="leading-snug">{t.en}</div>
                    <div className="leading-snug mt-0.5" dir="rtl">{t.ur}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {images && images.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-2">Examples</h4>
              <p className="text-xs text-gray-600 -mt-1 mb-2" dir="rtl">مثالیں</p>
              <div className="grid grid-cols-2 gap-3">
                {images.map((img, i) => (
                  <figure key={i} className="border rounded-lg bg-gray-50">
                    <div className="w-full h-40 flex items-center justify-center overflow-hidden p-2">
                      <img src={img.src} alt={img.label} className="max-w-full max-h-full object-contain" loading="lazy" draggable={false} />
                    </div>
                    <figcaption className="text-xs text-gray-600 px-2 pb-2">{img.label}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          <div className="text-lg text-gray-600">
            <span className="font-semibold">Accepted file types:</span> {accepted}
            <div className="mt-0.5" dir="rtl">
              <span className="font-semibold">مجاز فائل اقسام:</span> {accepted}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition">Cancel</button>
          <button onClick={onProceed} className={`px-5 py-2 rounded-lg font-medium text-white shadow-lg transition bg-gradient-to-r ${palette[variant].button}`}>Start Upload</button>
        </div>
      </div>
    </div>
  );

  const portalTarget = typeof window !== 'undefined' ? document.body : null;
  return portalTarget ? ReactDOM.createPortal(modalContent, portalTarget) : null;
};

export default UploadInstructionsModal;
