// Dummy medicine catalog for the MVP.
// `rx: true` => prescription required at checkout.
// `keywords` are used by the prescription scanner to match OCR text.

export const CATEGORIES = [
  { id: 'fever-pain', name: 'Fever & Pain', icon: '🌡️', color: '#fee2e2' },
  { id: 'cold-cough', name: 'Cold & Cough', icon: '🤧', color: '#e0f2fe' },
  { id: 'diabetes', name: 'Diabetes', icon: '🩸', color: '#fce7f3' },
  { id: 'heart-bp', name: 'Heart & BP', icon: '❤️', color: '#ffe4e6' },
  { id: 'antibiotics', name: 'Antibiotics', icon: '💊', color: '#ede9fe' },
  { id: 'stomach', name: 'Stomach Care', icon: '🫃', color: '#fef3c7' },
  { id: 'vitamins', name: 'Vitamins', icon: '🍊', color: '#dcfce7' },
  { id: 'skin', name: 'Skin Care', icon: '🧴', color: '#f5f5f4' },
  { id: 'allergy', name: 'Allergy', icon: '🌼', color: '#fef9c3' },
]

export const MEDICINES = [
  { id: 'm1', name: 'Dolo 650', generic: 'Paracetamol 650mg', category: 'fever-pain', price: 30, mrp: 34, pack: 'Strip of 15 tablets', rx: false, manufacturer: 'Micro Labs', keywords: ['dolo', 'paracetamol'], description: 'Used to relieve mild to moderate pain and reduce fever.' },
  { id: 'm2', name: 'Crocin Advance', generic: 'Paracetamol 500mg', category: 'fever-pain', price: 28, mrp: 32, pack: 'Strip of 15 tablets', rx: false, manufacturer: 'GSK', keywords: ['crocin'], description: 'Fast-acting fever and pain relief.' },
  { id: 'm3', name: 'Combiflam', generic: 'Ibuprofen + Paracetamol', category: 'fever-pain', price: 42, mrp: 48, pack: 'Strip of 20 tablets', rx: false, manufacturer: 'Sanofi', keywords: ['combiflam', 'ibuprofen'], description: 'Relieves pain, inflammation and fever.' },
  { id: 'm4', name: 'Zerodol SP', generic: 'Aceclofenac + Paracetamol + Serratiopeptidase', category: 'fever-pain', price: 112, mrp: 125, pack: 'Strip of 10 tablets', rx: true, manufacturer: 'Ipca Labs', keywords: ['zerodol', 'aceclofenac'], description: 'Used for pain and swelling in muscles and joints.' },

  { id: 'm5', name: 'Benadryl Cough Syrup', generic: 'Diphenhydramine', category: 'cold-cough', price: 118, mrp: 130, pack: 'Bottle of 150 ml', rx: false, manufacturer: 'Johnson & Johnson', keywords: ['benadryl'], description: 'Relief from cough and throat irritation.' },
  { id: 'm6', name: 'Vicks Action 500', generic: 'Paracetamol + Phenylephrine + Caffeine', category: 'cold-cough', price: 45, mrp: 50, pack: 'Strip of 10 tablets', rx: false, manufacturer: 'P&G', keywords: ['vicks'], description: 'Relief from cold, headache and blocked nose.' },
  { id: 'm7', name: 'Ascoril LS Syrup', generic: 'Ambroxol + Levosalbutamol + Guaifenesin', category: 'cold-cough', price: 108, mrp: 120, pack: 'Bottle of 100 ml', rx: true, manufacturer: 'Glenmark', keywords: ['ascoril', 'ambroxol'], description: 'Treats productive cough with mucus.' },

  { id: 'm8', name: 'Glycomet 500', generic: 'Metformin 500mg', category: 'diabetes', price: 22, mrp: 25, pack: 'Strip of 20 tablets', rx: true, manufacturer: 'USV', keywords: ['glycomet', 'metformin'], description: 'Controls blood sugar in type 2 diabetes.' },
  { id: 'm9', name: 'Janumet 50/500', generic: 'Sitagliptin + Metformin', category: 'diabetes', price: 285, mrp: 310, pack: 'Strip of 15 tablets', rx: true, manufacturer: 'MSD', keywords: ['janumet', 'sitagliptin'], description: 'Improves blood sugar control in adults with type 2 diabetes.' },
  { id: 'm10', name: 'Accu-Chek Test Strips', generic: 'Glucometer strips', category: 'diabetes', price: 899, mrp: 1050, pack: 'Box of 50 strips', rx: false, manufacturer: 'Roche', keywords: ['accu', 'accuchek'], description: 'Test strips for Accu-Chek glucometers.' },

  { id: 'm11', name: 'Telma 40', generic: 'Telmisartan 40mg', category: 'heart-bp', price: 198, mrp: 220, pack: 'Strip of 30 tablets', rx: true, manufacturer: 'Glenmark', keywords: ['telma', 'telmisartan'], description: 'Treats high blood pressure.' },
  { id: 'm12', name: 'Amlong 5', generic: 'Amlodipine 5mg', category: 'heart-bp', price: 55, mrp: 62, pack: 'Strip of 15 tablets', rx: true, manufacturer: 'Micro Labs', keywords: ['amlong', 'amlodipine'], description: 'Treats high blood pressure and chest pain.' },
  { id: 'm13', name: 'Ecosprin 75', generic: 'Aspirin 75mg', category: 'heart-bp', price: 5, mrp: 6, pack: 'Strip of 14 tablets', rx: true, manufacturer: 'USV', keywords: ['ecosprin', 'aspirin'], description: 'Prevents blood clots, heart attack and stroke.' },
  { id: 'm14', name: 'Atorva 10', generic: 'Atorvastatin 10mg', category: 'heart-bp', price: 98, mrp: 110, pack: 'Strip of 15 tablets', rx: true, manufacturer: 'Zydus', keywords: ['atorva', 'atorvastatin'], description: 'Lowers cholesterol.' },

  { id: 'm15', name: 'Azithral 500', generic: 'Azithromycin 500mg', category: 'antibiotics', price: 119, mrp: 132, pack: 'Strip of 5 tablets', rx: true, manufacturer: 'Alembic', keywords: ['azithral', 'azithromycin'], description: 'Antibiotic for bacterial infections.' },
  { id: 'm16', name: 'Augmentin 625 Duo', generic: 'Amoxicillin + Clavulanic Acid', category: 'antibiotics', price: 201, mrp: 223, pack: 'Strip of 10 tablets', rx: true, manufacturer: 'GSK', keywords: ['augmentin', 'amoxicillin'], description: 'Treats a wide range of bacterial infections.' },
  { id: 'm17', name: 'Ciplox 500', generic: 'Ciprofloxacin 500mg', category: 'antibiotics', price: 32, mrp: 36, pack: 'Strip of 10 tablets', rx: true, manufacturer: 'Cipla', keywords: ['ciplox', 'ciprofloxacin'], description: 'Antibiotic for urinary and other infections.' },

  { id: 'm18', name: 'Pan 40', generic: 'Pantoprazole 40mg', category: 'stomach', price: 145, mrp: 160, pack: 'Strip of 15 tablets', rx: true, manufacturer: 'Alkem', keywords: ['pan', 'pantoprazole'], description: 'Reduces stomach acid; treats acidity and ulcers.' },
  { id: 'm19', name: 'Digene Gel', generic: 'Antacid', category: 'stomach', price: 165, mrp: 180, pack: 'Bottle of 200 ml', rx: false, manufacturer: 'Abbott', keywords: ['digene'], description: 'Quick relief from acidity and gas.' },
  { id: 'm20', name: 'ORS Electral', generic: 'Oral Rehydration Salts', category: 'stomach', price: 21, mrp: 23, pack: 'Sachet of 21.8 g', rx: false, manufacturer: 'FDC', keywords: ['electral', 'ors'], description: 'Restores fluids and electrolytes.' },
  { id: 'm21', name: 'Ondem 4', generic: 'Ondansetron 4mg', category: 'stomach', price: 52, mrp: 58, pack: 'Strip of 10 tablets', rx: true, manufacturer: 'Alkem', keywords: ['ondem', 'ondansetron'], description: 'Prevents nausea and vomiting.' },

  { id: 'm22', name: 'Becosules Z', generic: 'Vitamin B-Complex + Zinc', category: 'vitamins', price: 46, mrp: 51, pack: 'Strip of 20 capsules', rx: false, manufacturer: 'Pfizer', keywords: ['becosules'], description: 'Daily vitamin supplement for energy and immunity.' },
  { id: 'm23', name: 'Shelcal 500', generic: 'Calcium + Vitamin D3', category: 'vitamins', price: 120, mrp: 134, pack: 'Strip of 15 tablets', rx: false, manufacturer: 'Torrent', keywords: ['shelcal', 'calcium'], description: 'Supports bone health.' },
  { id: 'm24', name: 'Limcee 500', generic: 'Vitamin C 500mg', category: 'vitamins', price: 24, mrp: 26, pack: 'Strip of 15 chewable tablets', rx: false, manufacturer: 'Abbott', keywords: ['limcee', 'vitamin c'], description: 'Boosts immunity.' },

  { id: 'm25', name: 'Betadine Ointment', generic: 'Povidone Iodine 5%', category: 'skin', price: 125, mrp: 138, pack: 'Tube of 20 g', rx: false, manufacturer: 'Win-Medicare', keywords: ['betadine', 'povidone'], description: 'Antiseptic for cuts and wounds.' },
  { id: 'm26', name: 'Candid Cream', generic: 'Clotrimazole 1%', category: 'skin', price: 98, mrp: 108, pack: 'Tube of 20 g', rx: false, manufacturer: 'Glenmark', keywords: ['candid', 'clotrimazole'], description: 'Treats fungal skin infections.' },

  { id: 'm27', name: 'Allegra 120', generic: 'Fexofenadine 120mg', category: 'allergy', price: 210, mrp: 232, pack: 'Strip of 10 tablets', rx: false, manufacturer: 'Sanofi', keywords: ['allegra', 'fexofenadine'], description: 'Relief from allergy symptoms like sneezing and runny nose.' },
  { id: 'm28', name: 'Cetzine 10', generic: 'Cetirizine 10mg', category: 'allergy', price: 18, mrp: 20, pack: 'Strip of 10 tablets', rx: false, manufacturer: 'GSK', keywords: ['cetzine', 'cetirizine'], description: 'Antihistamine for allergies.' },
  { id: 'm29', name: 'Montair LC', generic: 'Montelukast + Levocetirizine', category: 'allergy', price: 189, mrp: 210, pack: 'Strip of 10 tablets', rx: true, manufacturer: 'Cipla', keywords: ['montair', 'montelukast'], description: 'Treats allergic rhinitis and asthma symptoms.' },
]

export const getMedicine = (id) => MEDICINES.find((m) => m.id === id)
export const getCategory = (id) => CATEGORIES.find((c) => c.id === id)
