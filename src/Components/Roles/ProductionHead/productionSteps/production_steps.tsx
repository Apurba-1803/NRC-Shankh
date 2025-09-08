import React, { useState } from 'react';

const sidebarSections = [
  {
    title: 'Planning Details',
    items: ['New Job Started', 'Paper Store Details', 'Printing Details'],
  },
  {
    title: 'Production Details',
    items: [
      'Corrugation (Show only if any)',
      'Flute Lamination (if any)',
      'Flap Pasting',
      'Die Cutting',
      'Production Steps',
    ],
  },
  {
    title: 'QC Details',
    items: ['ABC'],
  },
  {
    title: 'Dispatch Details',
    items: ['ABC'],
  },
] as const;

type StepKey =
  | 'Corrugation (Show only if any)'
  | 'Flute Lamination (if any)'
  | 'Flap Pasting'
  | 'Die Cutting';

interface FieldDef {
  label: string;
  name: string;
  type: string;
}

interface FormSection {
  title: string;
  sectionHeaders: { label: string; fields: string[] }[];
  fields: FieldDef[];
}

const corrugationFields: FieldDef[] = [
  { label: 'Size', name: 'size', type: 'text' },
  { label: 'GSM 1', name: 'gsm1', type: 'text' },
  { label: 'GSM 2', name: 'gsm2', type: 'text' },
  { label: 'Flute', name: 'flute', type: 'text' },
  { label: 'Corrugation Machine', name: 'corrugationMachine', type: 'text' },
  { label: 'Corrugation Sheets Quantity', name: 'corrugationSheetsQty', type: 'number' },
  { label: 'Corrugation Date', name: 'corrugationDate', type: 'date' },
];

const fluteLaminationFields: FieldDef[] = [
  { label: 'Film', name: 'film', type: 'text' },
  { label: 'Adhesive', name: 'adhesive', type: 'text' },
  { label: 'Wastage', name: 'wastage', type: 'text' },
  { label: 'OK Quantity', name: 'okQuantity', type: 'text' },
  { label: 'Flute Laminator Machine', name: 'fluteLaminatorMachine', type: 'text' },
  { label: 'Flute Laminate Date', name: 'fluteLaminateDate', type: 'date' },
  { label: 'Flute Laminate Sheets', name: 'fluteLaminateSheets', type: 'text' },
];

const flapPastingFields: FieldDef[] = [
  { label: 'OPR Name', name: 'flapOprName', type: 'text' },
  { label: 'Adhesive', name: 'flapAdhesive', type: 'text' },
  { label: 'Wastage', name: 'flapWastage', type: 'text' },
  { label: 'OK Quantity', name: 'flapOkQuantity', type: 'text' },
  { label: 'Folder Gluer Machine', name: 'folderGluerMachine', type: 'text' },
  { label: 'Flap pasting Date', name: 'flapPastingDate', type: 'date' },
  { label: 'Flap pasting boxes', name: 'flapPastingBoxes', type: 'text' },
];

const dieCuttingFields: FieldDef[] = [
  { label: 'OPR Name', name: 'dieOprName', type: 'text' },
  { label: 'Adhesive', name: 'dieAdhesive', type: 'text' },
  { label: 'Wastage', name: 'dieWastage', type: 'text' },
  { label: 'OK Quantity', name: 'dieOkQuantity', type: 'text' },
  { label: 'Die Cutting Machine', name: 'dieCuttingMachine', type: 'text' },
  { label: 'Die Cutting Date', name: 'dieCuttingDate', type: 'date' },
  { label: 'Die Cutting Sheets', name: 'dieCuttingSheets', type: 'text' },
];

const formSections: Record<StepKey, FormSection> = {
  'Corrugation (Show only if any)': {
    title: 'Corrugation Form',
    sectionHeaders: [
      { label: 'Paper Information', fields: ['size', 'gsm1', 'gsm2', 'flute'] },
      { label: 'Machine & Quantity', fields: ['corrugationMachine', 'corrugationSheetsQty', 'corrugationDate'] },
    ],
    fields: corrugationFields,
  },
  'Flute Lamination (if any)': {
    title: 'Flute Lamination Details',
    sectionHeaders: [
      { label: 'Basic Information', fields: ['film', 'adhesive', 'wastage', 'okQuantity'] },
      { label: 'Machine & Quantity', fields: ['fluteLaminatorMachine', 'fluteLaminateDate', 'fluteLaminateSheets'] },
    ],
    fields: fluteLaminationFields,
  },
  'Flap Pasting': {
    title: 'Flap Pasting Details',
    sectionHeaders: [
      { label: 'Basic Information', fields: ['flapOprName', 'flapAdhesive', 'flapWastage', 'flapOkQuantity'] },
      { label: 'Machine & Quantity', fields: ['folderGluerMachine', 'flapPastingDate', 'flapPastingBoxes'] },
    ],
    fields: flapPastingFields,
  },
  'Die Cutting': {
    title: 'Die Cutting Details',
    sectionHeaders: [
      { label: 'Basic Information', fields: ['dieOprName', 'dieAdhesive', 'dieWastage', 'dieOkQuantity'] },
      { label: 'Machine & Quantity', fields: ['dieCuttingMachine', 'dieCuttingDate', 'dieCuttingSheets'] },
    ],
    fields: dieCuttingFields,
  },
};

const defaultStep: StepKey = 'Corrugation (Show only if any)';

type FormState = {
  // Corrugation fields
  size: string;
  gsm1: string;
  gsm2: string;
  flute: string;
  corrugationMachine: string;
  corrugationSheetsQty: string;
  corrugationDate: string;
  // Flute Lamination fields
  film: string;
  adhesive: string;
  wastage: string;
  okQuantity: string;
  fluteLaminatorMachine: string;
  fluteLaminateDate: string;
  fluteLaminateSheets: string;
  // Flap Pasting fields
  flapOprName: string;
  flapAdhesive: string;
  flapWastage: string;
  flapOkQuantity: string;
  folderGluerMachine: string;
  flapPastingDate: string;
  flapPastingBoxes: string;
  // Die Cutting fields
  dieOprName: string;
  dieAdhesive: string;
  dieWastage: string;
  dieOkQuantity: string;
  dieCuttingMachine: string;
  dieCuttingDate: string;
  dieCuttingSheets: string;
};

const initialFormState: FormState = {
  size: '',
  gsm1: '',
  gsm2: '',
  flute: '',
  corrugationMachine: '',
  corrugationSheetsQty: '',
  corrugationDate: '',
  film: '',
  adhesive: '',
  wastage: '',
  okQuantity: '',
  fluteLaminatorMachine: '',
  fluteLaminateDate: '',
  fluteLaminateSheets: '',
  flapOprName: '',
  flapAdhesive: '',
  flapWastage: '',
  flapOkQuantity: '',
  folderGluerMachine: '',
  flapPastingDate: '',
  flapPastingBoxes: '',
  dieOprName: '',
  dieAdhesive: '',
  dieWastage: '',
  dieOkQuantity: '',
  dieCuttingMachine: '',
  dieCuttingDate: '',
  dieCuttingSheets: '',
};

const ProductionSteps: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [selectedStep, setSelectedStep] = useState<StepKey>(defaultStep);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [error, setError] = useState('');

  const currentForm = formSections[selectedStep];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate only the fields for the current form
    const requiredFields = currentForm.fields.map((f) => f.name);
    for (const field of requiredFields) {
      if (!form[field as keyof FormState]) {
        setError('Please fill all required fields.');
        return;
      }
    }
    setError('');
    if (onBack) onBack();
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[70vh] ">
      {/* Sidebar/Table */}
      <aside className="w-full md:w-64 min-w-[220px] bg-transparent p-4 flex flex-col gap-4 md:sticky md:top-0 md:h-auto overflow-x-auto md:overflow-x-visible rounded-l-2xl">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            <div className="bg-blue-100 rounded px-3 py-1 font-semibold text-sm mb-1">{section.title}</div>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => (
                <div
                  key={item}
                  className={
                    (item === selectedStep
                      ? 'bg-[#F2F2F5] px-3 py-1 rounded text-black font-medium cursor-pointer'
                      : 'px-3 py-1 text-black cursor-pointer')
                  }
                  onClick={() => {
                    if (item in formSections) setSelectedStep(item as StepKey);
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </aside>
      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center p-2 md:p-0">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl flex flex-col items-center relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
            onClick={onBack}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-lg font-semibold text-center mb-6">{currentForm.title}</h2>
          <form className="w-full flex flex-col gap-6 items-center" onSubmit={handleSubmit}>
            {currentForm.sectionHeaders.map((section) => (
              <div className="w-full" key={section.label}>
                <div className="font-semibold mb-2">{section.label}</div>
                {section.fields.map((fieldName) => {
                  const field = currentForm.fields.find((f) => f.name === fieldName);
                  if (!field) return null;
                  return (
                    <div key={field.name} className="mb-4">
                      <label className="block font-medium mb-1">{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name as keyof FormState]}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                  );
                })}
              </div>
            ))}
            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
            <button
              type="submit"
              className="w-full bg-[#00AEEF] hover:bg-[#0095cc] text-white font-medium py-3 px-4 rounded-lg transition duration-300 mt-2 text-base hover:cursor-pointer"
            >
              Submit
            </button>
            <button
              type="button"
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-300 mt-3 text-base hover:cursor-pointer"
              onClick={onBack}
            >
              Back
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProductionSteps;
