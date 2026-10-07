import { matchMedicines } from '../src/utils/prescription.js'
const sample = `Dr. Anil Sharma Rx
1. Azithrai 500 - 1 tablet once daily
2. Dolo 650 SOS for fever
3. Pan 40 before breakfast
4. Montair LC at night
5. Becosu1es Z daily
Patient: Rahul Verma Advice: drink water`
console.log(matchMedicines(sample).map((m) => `${m.medicine.name} (${m.matchedWord}, ${m.confidence.toFixed(2)})`))
