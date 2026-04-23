// ===== TYPES =====
export type PatientType = 'adult' | 'pediatric';
export type SBTMethod = 'ttube' | 'ps' | 'cpap' | 'atc';
export type RiskLevel = 'low' | 'medium' | 'high';
export type WeaningDecision = 'ready' | 'caution' | 'wait';
export type VentStrategy = 'invasive' | 'niv' | 'conservative';

export interface VentMode {
  name: string;
  reason: string;
  settings: Record<string, string>;
}

export interface NewPatientResult {
  patientType: PatientType;
  age: number;
  riskScore: number;
  riskFactors: string[];
  bmi: string;
  idealWeight: number;
  bsa: string;
  egfr: number;
  abgInterpretation: string;
  severity: string;
  strategy: VentStrategy;
  modes: VentMode[];
}

export interface WeaningResult {
  weanScore: number;
  metCriteria: number;
  totalCriteria: number;
  decision: string;
  decisionClass: WeaningDecision;
  recommendations: string[];
  ventDay: number;
  isPediatric: boolean;
  rsbiThreshold: number;
  sbtDuration: string;
  parameters: {
    fio2: number;
    peep: number;
    ps: number;
    rsbi: number;
    spontVt: number;
    weanPh: number;
    weanPao2: number;
  };
}

export interface SBTResult {
  success: boolean;
  failReasons: string[];
  simulatedSpO2: number;
  simulatedRR: number;
  spO2Threshold: number;
  rrThreshold: number;
  durationMinutes: number;
  checkedCount: number;
  totalChecks: number;
  method: SBTMethod;
  isPediatric: boolean;
  sbtSeconds: number;
}

// ===== PEDIATRIC HELPERS =====
export function getAgeCategory(age: number): string {
  if (age < 1) return 'newborn';
  if (age < 2) return 'infant';
  if (age < 6) return 'earlyChildhood';
  if (age < 12) return 'schoolAge';
  return 'adolescent';
}

export function calculateIBW(age: number, weight: number, gender: string, patientType: PatientType, height: number): number {
  if (patientType === 'pediatric') {
    if (age < 1) return (age * 0.5) + 3.5;
    if (age < 10) return (age * 2) + 8;
    return weight;
  }
  if (gender === 'male') return 50 + 0.91 * (height - 152.4);
  return 45.5 + 0.91 * (height - 152.4);
}

export function calculateBSA(height: number, weight: number): number {
  return Math.sqrt((height * weight) / 3600);
}

export function calculateEGFR(creatinine: number, age: number, gender: string): number {
  if (creatinine <= 0) return 0;
  let egfr = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203);
  if (gender === 'female') egfr *= 0.742;
  return egfr;
}

// ===== NEW PATIENT ANALYSIS =====
export interface NewPatientInput {
  patientType: PatientType;
  age: number;
  weight: number;
  height: number;
  gender: string;
  ph: number;
  paco2: number;
  pao2: number;
  hco3: number;
  sao2: number;
  be: number;
  hb: number;
  creatinine: number;
  bun: number;
  ast: number;
  alt: number;
  albumin: number;
  lactate: number;
  pfRatio: number;
  comorbidities: string[];
  lungIssues: string[];
}

export function analyzeNewPatient(input: NewPatientInput): NewPatientResult {
  const { patientType, age, weight, height, gender, ph, paco2, pao2, hco3, sao2, be, hb, creatinine, ast, alt, albumin, lactate, pfRatio, comorbidities, lungIssues } = input;

  const bmi = weight / Math.pow(height / 100, 2);
  const idealWeight = calculateIBW(age, weight, gender, patientType, height);
  const bsa = calculateBSA(height, weight);

  let riskScore = 0;
  const riskFactors: string[] = [];

  // Age risk
  if (patientType === 'adult') {
    if (age > 65) { riskScore += 2; riskFactors.push('advancedAge'); }
    if (age > 80) { riskScore += 2; riskFactors.push('veryAdvancedAge'); }
  } else {
    if (age < 1) { riskScore += 3; riskFactors.push('newborn'); }
    else if (age < 2) { riskScore += 2; riskFactors.push('infant'); }
  }

  // Renal
  let egfr = 0;
  if (patientType === 'adult' && creatinine > 0) {
    egfr = calculateEGFR(creatinine, age, gender);
    if (egfr < 60) { riskScore += 2; riskFactors.push('renalFailure'); }
  } else if (patientType === 'pediatric' && creatinine > 0) {
    if (creatinine > (age < 2 ? 0.5 : 1.0)) {
      riskScore += 2;
      riskFactors.push('highCreatininePediatric');
    }
  }

  // Lab
  if (albumin > 0 && albumin < 2.5) { riskScore += 2; riskFactors.push('hypoalbuminemia'); }
  if (ast > 100 || alt > 100) { riskScore += 1; riskFactors.push('liverEnzymeElevation'); }
  if (patientType === 'adult' && hb > 0) {
    const hbNormal = gender === 'male' ? 13.5 : 12.0;
    if (hb < hbNormal) { riskScore += 1; riskFactors.push('anemia'); }
  }

  // ABG severity
  if (ph < 7.30) { riskScore += 3; riskFactors.push('severeAcidosis'); }
  if (lactate > 4) { riskScore += 3; riskFactors.push('severeLacticAcidosis'); }
  else if (lactate > 2) { riskScore += 1; riskFactors.push('mildLacticAcidosis'); }

  // Comorbidities
  const highRiskComorbidities = ['copd', 'ards', 'chf', 'cirrhosis', 'immunosuppression', 'neuromuscular'];
  highRiskComorbidities.forEach(item => {
    if (comorbidities.includes(item)) { riskScore += 2; riskFactors.push(item); }
  });
  if (comorbidities.includes('ckd')) { riskScore += 1; riskFactors.push('ckd'); }
  if (comorbidities.includes('diabetes')) { riskScore += 1; riskFactors.push('dm'); }
  if (comorbidities.includes('obesity') || bmi > 30) { riskScore += 1; riskFactors.push('obesityRisk'); }

  // Lung issues
  lungIssues.forEach(item => {
    riskScore += 2;
    riskFactors.push(item);
  });

  // ABG interpretation
  let abgInterpretation = '';
  let severity = 'mild';

  if (ph < 7.35 && paco2 > 45) {
    abgInterpretation = 'respiratoryAcidosis';
    if (paco2 > 60) severity = 'severe';
    else if (paco2 > 50) severity = 'moderate';
  } else if (ph > 7.45 && paco2 < 35) {
    abgInterpretation = 'respiratoryAlkalosis';
  } else if (ph < 7.35 && hco3 < 22) {
    abgInterpretation = 'metabolicAcidosis';
    if (be < -10) severity = 'severe';
  } else if (ph > 7.45 && hco3 > 26) {
    abgInterpretation = 'metabolicAlkalosis';
  }

  const pao2Threshold = patientType === 'pediatric' && age < 1 ? 60 : 80;
  if (pao2 < 60 || sao2 < 90) {
    severity = 'severe';
    abgInterpretation += (abgInterpretation ? ' + ' : '') + 'severeHypoxemia';
  } else if (pao2 < pao2Threshold) {
    if (severity === 'mild') severity = 'moderate';
    abgInterpretation += (abgInterpretation ? ' + ' : '') + 'hypoxemia';
  }

  // Strategy determination
  let strategy: VentStrategy = 'conservative';
  const modes: VentMode[] = [];
  const maxPressure = patientType === 'pediatric' ? (age < 1 ? 25 : 28) : 30;
  const peepStart = patientType === 'pediatric' ? (age < 1 ? 3 : 5) : 5;
  const vtTarget = patientType === 'pediatric' ? Math.round(5 * idealWeight) : Math.round(6 * idealWeight);

  let ardsSeverity = '';
  if (pfRatio > 0) {
    if (pfRatio < 100) ardsSeverity = 'severe';
    else if (pfRatio < 200) ardsSeverity = 'moderate';
    else if (pfRatio < 300) ardsSeverity = 'mild';
  }

  if (pao2 < 60 || paco2 > 60 || ph < 7.25 || riskScore > 8) {
    strategy = 'invasive';

    if (ardsSeverity === 'severe' || pfRatio < 150) {
      modes.push({
        name: patientType === 'pediatric' ? 'pcvVg' : 'prvcPcvVg',
        reason: 'lungProtective',
        settings: {
          vt: `${vtTarget} ml (${patientType === 'pediatric' ? '5-6' : '4-6'} ml/kg IBW)`,
          pip: `< ${maxPressure} cmH₂O`,
          peep: `${peepStart}-${peepStart + 5} cmH₂O`,
          fio2: pao2 < 60 ? '%60-100' : '%40-60',
          rate: patientType === 'pediatric' ? '20-30/dk' : '20-30/dk (ARDS)',
        },
      });
    } else {
      modes.push({
        name: 'pcv',
        reason: 'pressureControlled',
        settings: {
          pc: '15-20',
          peep: `${peepStart} cmH₂O`,
          fio2: pao2 < 60 ? '%60-100' : '%40-60',
          rate: patientType === 'pediatric' ? '20-25/dk' : '14-20/dk',
        },
      });
    }

    if (comorbidities.includes('copd') || comorbidities.includes('asthma')) {
      modes.push({
        name: 'pcvLongExhale',
        reason: 'obstructionManagement',
        settings: {
          ie: '1:3-1:4',
          peep: patientType === 'pediatric' ? '0-3' : '0-5 (intrinsic PEEP)',
          bronchodilator: 'bronchodilatorRequired',
        },
      });
    }
  } else if (paco2 > 45 || pao2 < 80 || riskScore > 4) {
    strategy = 'niv';
    modes.push({
      name: patientType === 'pediatric' ? 'cpapBipapPediatric' : 'bipapST',
      reason: 'niv',
      settings: {
        ipap: patientType === 'pediatric' ? '8-12' : '12-16',
        epap: patientType === 'pediatric' ? '4-6' : '6',
        fio2: pao2 < 70 ? '%50-60' : '%40-50',
      },
    });
  } else {
    strategy = 'conservative';
    modes.push({
      name: patientType === 'pediatric' ? 'nasalCannula' : 'hfnc',
      reason: 'conservativeO2',
      settings: {
        flow: patientType === 'pediatric' ? '1-2 L/kg/dk' : '40-60 L/dk',
        fio2: '%30-40',
      },
    });
  }

  return {
    patientType,
    age,
    riskScore,
    riskFactors,
    bmi: bmi.toFixed(1),
    idealWeight: Math.round(idealWeight),
    bsa: bsa.toFixed(2),
    egfr: Math.round(egfr),
    abgInterpretation,
    severity,
    strategy,
    modes,
  };
}

// ===== WEANING ANALYSIS =====
export interface WeaningInput {
  patientType: PatientType;
  age: number;
  weight: number;
  ventDay: number;
  fio2: number;
  peep: number;
  ps: number;
  rsbi: number;
  spontVt: number;
  weanPh: number;
  weanPao2: number;
  weanPaco2: number;
  criteria: Record<string, boolean>;
  complications: string[];
}

export function analyzeWeaning(input: WeaningInput): WeaningResult {
  const { patientType, age, weight, ventDay, fio2, peep, ps, rsbi, spontVt, weanPh, weanPao2, weanPaco2, criteria, complications } = input;
  const isPediatric = patientType === 'pediatric';

  const metCriteria = Object.values(criteria).filter(v => v).length;
  const totalCriteria = Object.keys(criteria).length;

  const rsbiThreshold = isPediatric ? (age < 2 ? 8 : 10) : 105;
  const sbtDuration = isPediatric ? '30-60' : '30-120';
  const extubationCriteria = isPediatric ? 'SpO₂ > %92, RR < 50' : 'SpO₂ > %90, RR < 35';

  let weanScore = 0;

  if (fio2 <= 0.4) weanScore += 15;
  else if (fio2 <= 0.5) weanScore += 10;

  if (peep <= (isPediatric ? 5 : 5)) weanScore += 15;
  else if (peep <= 8) weanScore += 10;

  if (rsbi < rsbiThreshold) weanScore += 20;
  else if (rsbi < rsbiThreshold * 1.5) weanScore += 10;

  if (spontVt > (isPediatric ? weight * 5 : 300)) weanScore += 10;

  if (weanPh >= 7.35 && weanPh <= 7.45) weanScore += 10;
  if (weanPao2 > (isPediatric ? 60 : 60)) weanScore += 10;
  if (weanPaco2 < (isPediatric ? 50 : 50)) weanScore += 10;

  weanScore += (metCriteria / totalCriteria) * 20;

  complications.forEach(() => { weanScore -= 10; });

  weanScore = Math.max(0, Math.min(100, Math.round(weanScore)));

  let decision = '';
  let decisionClass: WeaningDecision = 'wait';
  let recommendations: string[] = [];

  const highScoreThreshold = isPediatric ? 75 : 80;
  const mediumScoreThreshold = isPediatric ? 60 : 60;

  if (weanScore >= highScoreThreshold && metCriteria >= 8) {
    decision = 'weaningReady';
    decisionClass = 'ready';
    recommendations = [
      `startSBT_${sbtDuration}`,
      'methodPS',
      `extubationEval_${extubationCriteria}`,
      'swallowCheck',
      'nivProphylaxis',
    ];
  } else if (weanScore >= mediumScoreThreshold && metCriteria >= 6) {
    decision = 'weaningCaution';
    decisionClass = 'caution';
    recommendations = ['dailySBT', 'psvReduction', 'rehabilitation', 'sedationMinimization'];
  } else {
    decision = 'weaningWait';
    decisionClass = 'wait';
    recommendations = ['underlyingCause', 'dailyAwakening', 'nutritionOptimization', 'respiratoryStrengthening'];
  }

  const prolongedDays = 14;
  if (ventDay > prolongedDays) {
    recommendations.unshift(isPediatric ? 'prolongedMV_pediatric' : 'prolongedMV');
  }

  return {
    weanScore,
    metCriteria,
    totalCriteria,
    decision,
    decisionClass,
    recommendations,
    ventDay,
    isPediatric,
    rsbiThreshold,
    sbtDuration,
    parameters: { fio2, peep, ps, rsbi, spontVt, weanPh, weanPao2 },
  };
}

// ===== SBT EVALUATION =====
export interface SBTInput {
  isPediatric: boolean;
  age: number;
  weight: number;
  spo2: number;
  rr: number;
  checkedCount: number;
  totalChecks: number;
  sbtSeconds: number;
  method: SBTMethod;
}

export function evaluateSBT(input: SBTInput): SBTResult {
  const { isPediatric, age, spo2, rr, checkedCount, totalChecks, sbtSeconds, method } = input;

  const durationMinutes = Math.floor(sbtSeconds / 60);
  const minDuration = 30;
  const spO2Threshold = isPediatric ? 92 : 90;
  const rrThreshold = isPediatric ? (age < 1 ? 60 : 50) : 35;

  const simulatedSpO2 = spo2 - (Math.random() * 5);
  const simulatedRR = rr + (Math.random() * 10 - 2);

  let success = true;
  const failReasons: string[] = [];

  if (simulatedSpO2 < spO2Threshold) {
    success = false;
    failReasons.push(`SpO₂ (${simulatedSpO2.toFixed(1)}%)`);
  }
  if (simulatedRR > rrThreshold) {
    success = false;
    failReasons.push(`RR (${simulatedRR.toFixed(0)}/min)`);
  }
  if (checkedCount < 6) {
    success = false;
    failReasons.push(`Checklist (${checkedCount}/${totalChecks})`);
  }
  if (durationMinutes < minDuration) {
    success = false;
    failReasons.push(`Duration (${durationMinutes} < ${minDuration} min)`);
  }

  return {
    success,
    failReasons,
    simulatedSpO2,
    simulatedRR,
    spO2Threshold,
    rrThreshold,
    durationMinutes,
    checkedCount,
    totalChecks,
    method,
    isPediatric,
    sbtSeconds,
  };
}
