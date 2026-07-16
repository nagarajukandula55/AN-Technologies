export type DocType = "Invoice" | "Estimate" | "Receipt" | "Purchase Order" | "Delivery Note";
type LineItem = { description: string; quantity: number; unitPrice: number };

const PARTY_LABEL: Record<DocType, string> = {
  Invoice: "Bill to",
  Estimate: "Prepared for",
  Receipt: "Received from",
  "Purchase Order": "Vendor",
  "Delivery Note": "Deliver to",
};

const FOOTNOTE: Partial<Record<DocType, string>> = {
  Estimate: "This is an estimate, not an invoice. Prices are subject to change until confirmed.",
  "Purchase Order": "Please confirm receipt of this order and expected delivery date.",
  "Delivery Note": "Goods received in good condition — please sign and return a copy.",
};

type PrintableDocumentProps = {
  docType: DocType;
  docNumber: string;
  fromName: string;
  toName: string;
  dateLabel: string;
  items: LineItem[];
  notes: string;
  logoDataUrl: string | null;
  showWatermark: boolean;
  showPrices: boolean;
};

export function PrintableDocument({
  docType,
  docNumber,
  fromName,
  toName,
  dateLabel,
  items,
  notes,
  logoDataUrl,
  showWatermark,
  showPrices,
}: PrintableDocumentProps) {
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="print-area relative mx-auto max-w-[210mm] bg-white p-10 text-slate-900 shadow-sm ring-1 ring-slate-200">
      {showWatermark && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span className="rotate-[-30deg] text-5xl font-bold text-slate-100 select-none">
            AN Technologies — Free Plan
          </span>
        </div>
      )}

      <div className="relative flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide">{docType}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {docType} #: {docNumber || "—"}
          </p>
          <p className="text-sm text-slate-500">{dateLabel}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logoDataUrl && <img src={logoDataUrl} alt="Logo" className="h-16 w-auto object-contain" />}
      </div>

      <div className="relative mt-8 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="font-semibold text-slate-500">From</p>
          <p className="mt-1">{fromName || "—"}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-500">{PARTY_LABEL[docType]}</p>
          <p className="mt-1">{toName || "—"}</p>
        </div>
      </div>

      <table className="relative mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left text-slate-500">
            <th className="pb-2 font-semibold">Description</th>
            <th className="pb-2 font-semibold">Qty</th>
            {showPrices && <th className="pb-2 font-semibold">Unit Price</th>}
            {showPrices && <th className="pb-2 text-right font-semibold">Amount</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-2">{item.description || "—"}</td>
              <td className="py-2">{item.quantity}</td>
              {showPrices && <td className="py-2">${item.unitPrice.toFixed(2)}</td>}
              {showPrices && (
                <td className="py-2 text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showPrices && (
        <div className="relative mt-6 flex justify-end">
          <div className="w-48 text-right">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold">${total.toFixed(2)}</p>
          </div>
        </div>
      )}

      {notes && (
        <div className="relative mt-8 border-t border-slate-200 pt-4 text-sm">
          <p className="font-semibold text-slate-500">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-slate-700">{notes}</p>
        </div>
      )}

      {FOOTNOTE[docType] && (
        <p className="relative mt-10 text-xs text-slate-400">{FOOTNOTE[docType]}</p>
      )}
    </div>
  );
}
