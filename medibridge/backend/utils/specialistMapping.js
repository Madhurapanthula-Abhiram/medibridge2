// Specialist mapping based on common illnesses and conditions
const specialistMapping = {
  // Head and Brain
  'migraine': 'Neurologist',
  'headache': 'Neurologist',
  'stroke': 'Neurologist',
  'seizure': 'Neurologist',
  'epilepsy': 'Neurologist',
  'brain tumor': 'Neurologist',
  'multiple sclerosis': 'Neurologist',
  'parkinson\'s': 'Neurologist',
  'alzheimer': 'Neurologist',
  
  // Heart and Circulation
  'chest pain': 'Cardiologist',
  'heart attack': 'Cardiologist',
  'heart disease': 'Cardiologist',
  'hypertension': 'Cardiologist',
  'high blood pressure': 'Cardiologist',
  'arrhythmia': 'Cardiologist',
  'palpitations': 'Cardiologist',
  'heart failure': 'Cardiologist',
  
  // Skin
  'skin rash': 'Dermatologist',
  'acne': 'Dermatologist',
  'eczema': 'Dermatologist',
  'psoriasis': 'Dermatologist',
  'skin infection': 'Dermatologist',
  'melanoma': 'Dermatologist',
  'skin cancer': 'Dermatologist',
  'hives': 'Dermatologist',
  
  // Stomach and Digestion
  'stomach pain': 'Gastroenterologist',
  'abdominal pain': 'Gastroenterologist',
  'diarrhea': 'Gastroenterologist',
  'constipation': 'Gastroenterologist',
  'acid reflux': 'Gastroenterologist',
  'gerd': 'Gastroenterologist',
  'ulcer': 'Gastroenterologist',
  'ibd': 'Gastroenterologist',
  'crohn\'s': 'Gastroenterologist',
  'colitis': 'Gastroenterologist',
  
  // Mental Health
  'depression': 'Psychiatrist',
  'anxiety': 'Psychiatrist',
  'bipolar': 'Psychiatrist',
  'schizophrenia': 'Psychiatrist',
  'ocd': 'Psychiatrist',
  'ptsd': 'Psychiatrist',
  'panic attack': 'Psychiatrist',
  'insomnia': 'Psychiatrist',
  
  // Bones and Joints
  'arthritis': 'Rheumatologist',
  'joint pain': 'Rheumatologist',
  'back pain': 'Orthopedic Surgeon',
  'bone fracture': 'Orthopedic Surgeon',
  'osteoporosis': 'Rheumatologist',
  'lupus': 'Rheumatologist',
  'fibromyalgia': 'Rheumatologist',
  
  // Hormones and Glands
  'diabetes': 'Endocrinologist',
  'thyroid': 'Endocrinologist',
  'hormone imbalance': 'Endocrinologist',
  'obesity': 'Endocrinologist',
  'metabolic disorder': 'Endocrinologist',
  
  // Kidneys
  'kidney disease': 'Nephrologist',
  'kidney stones': 'Nephrologist',
  'renal failure': 'Nephrologist',
  'urinary problems': 'Urologist',
  
  // Lungs
  'asthma': 'Pulmonologist',
  'copd': 'Pulmonologist',
  'pneumonia': 'Pulmonologist',
  'lung cancer': 'Pulmonologist',
  'breathing problems': 'Pulmonologist',
  'tuberculosis': 'Pulmonologist',
  
  // Cancer
  'cancer': 'Oncologist',
  'tumor': 'Oncologist',
  'leukemia': 'Oncologist',
  'lymphoma': 'Oncologist',
  
  // Women's Health
  'pregnancy': 'Obstetrician-Gynecologist',
  'menstrual problems': 'Obstetrician-Gynecologist',
  'pcos': 'Obstetrician-Gynecologist',
  'endometriosis': 'Obstetrician-Gynecologist',
  'menopause': 'Obstetrician-Gynecologist',
  
  // Children
  'pediatric': 'Pediatrician',
  'child fever': 'Pediatrician',
  'childhood illness': 'Pediatrician',
  'vaccination': 'Pediatrician',
  
  // Eyes
  'eye problems': 'Ophthalmologist',
  'vision loss': 'Ophthalmologist',
  'glaucoma': 'Ophthalmologist',
  'cataract': 'Ophthalmologist',
  
  // Ears, Nose, Throat
  'ear infection': 'ENT Specialist',
  'sinus': 'ENT Specialist',
  'sore throat': 'ENT Specialist',
  'hearing loss': 'ENT Specialist',
  'tonsillitis': 'ENT Specialist',
  
  // General/Fallback
  'fever': 'General Physician',
  'cold': 'General Physician',
  'flu': 'General Physician',
  'cough': 'General Physician',
  'fatigue': 'General Physician',
  'weakness': 'General Physician',
  'weight loss': 'General Physician',
  'dizziness': 'General Physician',
  'nausea': 'General Physician',
  'vomiting': 'General Physician'
};

// Function to map illness to specialist
function mapIllnessToSpecialist(illnessName) {
  const lowerIllness = illnessName.toLowerCase();
  
  // Direct mapping
  if (specialistMapping[lowerIllness]) {
    return specialistMapping[lowerIllness];
  }
  
  // Partial matching
  for (const [condition, specialist] of Object.entries(specialistMapping)) {
    if (lowerIllness.includes(condition) || condition.includes(lowerIllness)) {
      return specialist;
    }
  }
  
  // Fallback to General Physician
  return 'General Physician';
}

// Function to get specialist from symptoms
function getSpecialistFromSymptoms(symptoms) {
  const lowerSymptoms = symptoms.toLowerCase();
  
  // Check for specific symptom patterns
  if (lowerSymptoms.includes('chest') && lowerSymptoms.includes('pain')) {
    return 'Cardiologist';
  }
  if (lowerSymptoms.includes('headache') || lowerSymptoms.includes('migraine')) {
    return 'Neurologist';
  }
  if (lowerSymptoms.includes('skin') || lowerSymptoms.includes('rash')) {
    return 'Dermatologist';
  }
  if (lowerSymptoms.includes('stomach') || lowerSymptoms.includes('abdominal')) {
    return 'Gastroenterologist';
  }
  if (lowerSymptoms.includes('depressed') || lowerSymptoms.includes('anxious')) {
    return 'Psychiatrist';
  }
  if (lowerSymptoms.includes('joint') || lowerSymptoms.includes('arthritis')) {
    return 'Rheumatologist';
  }
  
  return 'General Physician';
}

module.exports = {
  mapIllnessToSpecialist,
  getSpecialistFromSymptoms,
  specialistMapping
};
