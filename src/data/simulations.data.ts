/**
 * simulations.data.ts
 * Datenmodell für interaktive Fallsimulationen
 */

// Basis-Interface für alle Simulationen
interface BaseSimulation {
  id: string;
  type: 'decision_tree' | 'skill_trainer';
  titleKey: string;
  descriptionKey: string;
}

// Interface für Entscheidungsbaum-Simulationen
interface DecisionTreeChoice {
  textKey: string;
  nextNodeId: string;
}

interface DecisionTreeNode {
  textKey: string;
  choices?: DecisionTreeChoice[];
  isEndNode?: boolean;
  feedbackKey?: string;
}

export interface DecisionTreeSimulation extends BaseSimulation {
  type: 'decision_tree';
  startNodeId: string;
  nodes: Record<string, DecisionTreeNode>;
}

// Interface für Skill-Trainer-Simulationen
interface SkillTrainerStep {
  id: string;
  instructionKey: string;
  type: 'drag_and_drop_selection' | 'sequence' | 'multiple_choice' | 'text_input';
  items?: SkillTrainerItem[];
  correctAnswer: string[] | string;
  feedbackIncorrectKey?: string;
  feedbackCorrectKey?: string;
}

interface SkillTrainerItem {
  id: string;
  textKey: string;
  imageKey?: string;
}

export interface SkillTrainerSimulation extends BaseSimulation {
  type: 'skill_trainer';
  steps: SkillTrainerStep[];
}

// Union Type für alle Simulationen
export type Simulation = DecisionTreeSimulation | SkillTrainerSimulation;

// Beispiel-Daten für Entscheidungsbaum: Postoperative Überwachung
const casePostopMonitoring: DecisionTreeSimulation = {
  id: 'case_postop_monitoring',
  type: 'decision_tree',
  titleKey: 'cases.postop_monitoring.title',
  descriptionKey: 'cases.postop_monitoring.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.postop_monitoring.nodes.node_01.text',
      choices: [
        { textKey: 'cases.postop_monitoring.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.postop_monitoring.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.postop_monitoring.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.postop_monitoring.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.postop_monitoring.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.postop_monitoring.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.postop_monitoring.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.postop_monitoring.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.postop_monitoring.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.postop_monitoring.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.postop_monitoring.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.postop_monitoring.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.postop_monitoring.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.postop_monitoring.nodes.node_03b.feedback'
    }
  }
};

// Beispiel-Daten für Skill-Trainer: Subkutane Injektion
const skillScInjection: SkillTrainerSimulation = {
  id: 'skill_sc_injection',
  type: 'skill_trainer',
  titleKey: 'skills.sc_injection.title',
  descriptionKey: 'skills.sc_injection.description',
  steps: [
    {
      id: 'step_01',
      instructionKey: 'skills.sc_injection.steps.step_01.instruction',
      type: 'drag_and_drop_selection',
      items: [
        { id: 'item_01', textKey: 'skills.sc_injection.steps.step_01.items.item_01' },
        { id: 'item_02', textKey: 'skills.sc_injection.steps.step_01.items.item_02' },
        { id: 'item_03', textKey: 'skills.sc_injection.steps.step_01.items.item_03' },
        { id: 'item_04', textKey: 'skills.sc_injection.steps.step_01.items.item_04' },
        { id: 'item_05', textKey: 'skills.sc_injection.steps.step_01.items.item_05' },
        { id: 'item_06', textKey: 'skills.sc_injection.steps.step_01.items.item_06' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_03', 'item_04'],
      feedbackIncorrectKey: 'skills.sc_injection.steps.step_01.feedback_incorrect',
      feedbackCorrectKey: 'skills.sc_injection.steps.step_01.feedback_correct'
    },
    {
      id: 'step_02',
      instructionKey: 'skills.sc_injection.steps.step_02.instruction',
      type: 'sequence',
      items: [
        { id: 'seq_01', textKey: 'skills.sc_injection.steps.step_02.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.sc_injection.steps.step_02.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.sc_injection.steps.step_02.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.sc_injection.steps.step_02.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.sc_injection.steps.step_02.items.seq_05' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05'],
      feedbackIncorrectKey: 'skills.sc_injection.steps.step_02.feedback_incorrect',
      feedbackCorrectKey: 'skills.sc_injection.steps.step_02.feedback_correct'
    },
    {
      id: 'step_03',
      instructionKey: 'skills.sc_injection.steps.step_03.instruction',
      type: 'multiple_choice',
      items: [
        { id: 'mc_01', textKey: 'skills.sc_injection.steps.step_03.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.sc_injection.steps.step_03.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.sc_injection.steps.step_03.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.sc_injection.steps.step_03.items.mc_04' }
      ],
      correctAnswer: 'mc_02',
      feedbackIncorrectKey: 'skills.sc_injection.steps.step_03.feedback_incorrect',
      feedbackCorrectKey: 'skills.sc_injection.steps.step_03.feedback_correct'
    }
  ]
};

// Weitere realistische Fälle - Teil 1: Notfall/Intensiv/Chirurgie/Innere Medizin

// Fall 2: Akuter Myokardinfarkt
const caseAcuteMyocardialInfarction: DecisionTreeSimulation = {
  id: 'case_acute_mi',
  type: 'decision_tree',
  titleKey: 'cases.acute_mi.title',
  descriptionKey: 'cases.acute_mi.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.acute_mi.nodes.node_01.text',
      choices: [
        { textKey: 'cases.acute_mi.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.acute_mi.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.acute_mi.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.acute_mi.nodes.node_02a.text',
      isEndNode: true,
      feedbackKey: 'cases.acute_mi.nodes.node_02a.feedback'
    },
    'node_02b': {
      textKey: 'cases.acute_mi.nodes.node_02b.text',
      choices: [
        { textKey: 'cases.acute_mi.nodes.node_02b.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.acute_mi.nodes.node_02b.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02c': {
      textKey: 'cases.acute_mi.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.acute_mi.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.acute_mi.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.acute_mi.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.acute_mi.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.acute_mi.nodes.node_03b.feedback'
    }
  }
};

// Fall 3: Anaphylaktische Reaktion
const caseAnaphylaxis: DecisionTreeSimulation = {
  id: 'case_anaphylaxis',
  type: 'decision_tree',
  titleKey: 'cases.anaphylaxis.title',
  descriptionKey: 'cases.anaphylaxis.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.anaphylaxis.nodes.node_01.text',
      choices: [
        { textKey: 'cases.anaphylaxis.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.anaphylaxis.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.anaphylaxis.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.anaphylaxis.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.anaphylaxis.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.anaphylaxis.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.anaphylaxis.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.anaphylaxis.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.anaphylaxis.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.anaphylaxis.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.anaphylaxis.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.anaphylaxis.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.anaphylaxis.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.anaphylaxis.nodes.node_03b.feedback'
    }
  }
};

// Fall 4: Akute Atemnot
const caseAcuteDyspnea: DecisionTreeSimulation = {
  id: 'case_acute_dyspnea',
  type: 'decision_tree',
  titleKey: 'cases.acute_dyspnea.title',
  descriptionKey: 'cases.acute_dyspnea.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.acute_dyspnea.nodes.node_01.text',
      choices: [
        { textKey: 'cases.acute_dyspnea.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.acute_dyspnea.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.acute_dyspnea.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.acute_dyspnea.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.acute_dyspnea.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.acute_dyspnea.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.acute_dyspnea.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.acute_dyspnea.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.acute_dyspnea.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.acute_dyspnea.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.acute_dyspnea.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.acute_dyspnea.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.acute_dyspnea.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.acute_dyspnea.nodes.node_03b.feedback'
    }
  }
};

// Fall 5: Hypoglykämie
const caseHypoglycemia: DecisionTreeSimulation = {
  id: 'case_hypoglycemia',
  type: 'decision_tree',
  titleKey: 'cases.hypoglycemia.title',
  descriptionKey: 'cases.hypoglycemia.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.hypoglycemia.nodes.node_01.text',
      choices: [
        { textKey: 'cases.hypoglycemia.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.hypoglycemia.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.hypoglycemia.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.hypoglycemia.nodes.node_02a.text',
      isEndNode: true,
      feedbackKey: 'cases.hypoglycemia.nodes.node_02a.feedback'
    },
    'node_02b': {
      textKey: 'cases.hypoglycemia.nodes.node_02b.text',
      choices: [
        { textKey: 'cases.hypoglycemia.nodes.node_02b.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.hypoglycemia.nodes.node_02b.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02c': {
      textKey: 'cases.hypoglycemia.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.hypoglycemia.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.hypoglycemia.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.hypoglycemia.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.hypoglycemia.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.hypoglycemia.nodes.node_03b.feedback'
    }
  }
};

// Fall 6: Schlaganfall-Erkennung
const caseStroke: DecisionTreeSimulation = {
  id: 'case_stroke',
  type: 'decision_tree',
  titleKey: 'cases.stroke.title',
  descriptionKey: 'cases.stroke.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.stroke.nodes.node_01.text',
      choices: [
        { textKey: 'cases.stroke.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.stroke.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.stroke.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.stroke.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.stroke.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.stroke.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.stroke.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.stroke.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.stroke.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.stroke.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.stroke.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.stroke.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.stroke.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.stroke.nodes.node_03b.feedback'
    }
  }
};

// Fall 7: Sepsis-Verdacht
const caseSepsis: DecisionTreeSimulation = {
  id: 'case_sepsis',
  type: 'decision_tree',
  titleKey: 'cases.sepsis.title',
  descriptionKey: 'cases.sepsis.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.sepsis.nodes.node_01.text',
      choices: [
        { textKey: 'cases.sepsis.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.sepsis.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.sepsis.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.sepsis.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.sepsis.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.sepsis.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.sepsis.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.sepsis.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.sepsis.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.sepsis.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.sepsis.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.sepsis.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.sepsis.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.sepsis.nodes.node_03b.feedback'
    }
  }
};

// Fall 8: Postoperative Wundheilungsstörung
const caseWoundHealing: DecisionTreeSimulation = {
  id: 'case_wound_healing',
  type: 'decision_tree',
  titleKey: 'cases.wound_healing.title',
  descriptionKey: 'cases.wound_healing.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.wound_healing.nodes.node_01.text',
      choices: [
        { textKey: 'cases.wound_healing.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.wound_healing.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.wound_healing.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.wound_healing.nodes.node_02a.text',
      isEndNode: true,
      feedbackKey: 'cases.wound_healing.nodes.node_02a.feedback'
    },
    'node_02b': {
      textKey: 'cases.wound_healing.nodes.node_02b.text',
      choices: [
        { textKey: 'cases.wound_healing.nodes.node_02b.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.wound_healing.nodes.node_02b.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02c': {
      textKey: 'cases.wound_healing.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.wound_healing.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.wound_healing.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.wound_healing.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.wound_healing.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.wound_healing.nodes.node_03b.feedback'
    }
  }
};

// Fall 9: Gastrointestinale Blutung
const caseGIBleed: DecisionTreeSimulation = {
  id: 'case_gi_bleed',
  type: 'decision_tree',
  titleKey: 'cases.gi_bleed.title',
  descriptionKey: 'cases.gi_bleed.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.gi_bleed.nodes.node_01.text',
      choices: [
        { textKey: 'cases.gi_bleed.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.gi_bleed.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.gi_bleed.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.gi_bleed.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.gi_bleed.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.gi_bleed.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.gi_bleed.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.gi_bleed.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.gi_bleed.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.gi_bleed.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.gi_bleed.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.gi_bleed.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.gi_bleed.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.gi_bleed.nodes.node_03b.feedback'
    }
  }
};

// Fall 10: Hypertensive Krise
const caseHypertensiveCrisis: DecisionTreeSimulation = {
  id: 'case_hypertensive_crisis',
  type: 'decision_tree',
  titleKey: 'cases.hypertensive_crisis.title',
  descriptionKey: 'cases.hypertensive_crisis.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.hypertensive_crisis.nodes.node_01.text',
      choices: [
        { textKey: 'cases.hypertensive_crisis.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.hypertensive_crisis.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.hypertensive_crisis.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.hypertensive_crisis.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.hypertensive_crisis.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.hypertensive_crisis.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.hypertensive_crisis.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.hypertensive_crisis.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.hypertensive_crisis.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.hypertensive_crisis.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.hypertensive_crisis.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.hypertensive_crisis.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.hypertensive_crisis.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.hypertensive_crisis.nodes.node_03b.feedback'
    }
  }
};

// Praktische Skills - Teil 1: Grundpflege, Hygiene, Vitalzeichen

// Skill 2: Blutdruckmessung
const skillBloodPressure: SkillTrainerSimulation = {
  id: 'skill_blood_pressure',
  type: 'skill_trainer',
  titleKey: 'skills.blood_pressure.title',
  descriptionKey: 'skills.blood_pressure.description',
  steps: [
    {
      type: 'multiple_choice',
      instructionKey: 'skills.blood_pressure.steps.step_01.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.blood_pressure.steps.step_01.items.item_01' },
        { id: 'item_02', textKey: 'skills.blood_pressure.steps.step_01.items.item_02' },
        { id: 'item_03', textKey: 'skills.blood_pressure.steps.step_01.items.item_03' },
        { id: 'item_04', textKey: 'skills.blood_pressure.steps.step_01.items.item_04' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_03'],
      feedbackCorrectKey: 'skills.blood_pressure.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.blood_pressure.steps.step_01.feedback_incorrect'
    },
    {
      type: 'sequence',
      instructionKey: 'skills.blood_pressure.steps.step_02.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.blood_pressure.steps.step_02.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.blood_pressure.steps.step_02.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.blood_pressure.steps.step_02.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.blood_pressure.steps.step_02.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.blood_pressure.steps.step_02.items.seq_05' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05'],
      feedbackCorrectKey: 'skills.blood_pressure.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.blood_pressure.steps.step_02.feedback_incorrect'
    },
    {
      type: 'single_choice',
      instructionKey: 'skills.blood_pressure.steps.step_03.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.blood_pressure.steps.step_03.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.blood_pressure.steps.step_03.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.blood_pressure.steps.step_03.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.blood_pressure.steps.step_03.items.mc_04' }
      ],
      correctAnswer: 'mc_02',
      feedbackCorrectKey: 'skills.blood_pressure.steps.step_03.feedback_correct',
      feedbackIncorrectKey: 'skills.blood_pressure.steps.step_03.feedback_incorrect'
    }
  ]
};

// Skill 3: Händedesinfektion
const skillHandHygiene: SkillTrainerSimulation = {
  id: 'skill_hand_hygiene',
  type: 'skill_trainer',
  titleKey: 'skills.hand_hygiene.title',
  descriptionKey: 'skills.hand_hygiene.description',
  steps: [
    {
      type: 'single_choice',
      instructionKey: 'skills.hand_hygiene.steps.step_01.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.hand_hygiene.steps.step_01.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.hand_hygiene.steps.step_01.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.hand_hygiene.steps.step_01.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.hand_hygiene.steps.step_01.items.mc_04' }
      ],
      correctAnswer: 'mc_03',
      feedbackCorrectKey: 'skills.hand_hygiene.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.hand_hygiene.steps.step_01.feedback_incorrect'
    },
    {
      type: 'sequence',
      instructionKey: 'skills.hand_hygiene.steps.step_02.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.hand_hygiene.steps.step_02.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.hand_hygiene.steps.step_02.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.hand_hygiene.steps.step_02.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.hand_hygiene.steps.step_02.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.hand_hygiene.steps.step_02.items.seq_05' },
        { id: 'seq_06', textKey: 'skills.hand_hygiene.steps.step_02.items.seq_06' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05', 'seq_06'],
      feedbackCorrectKey: 'skills.hand_hygiene.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.hand_hygiene.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 4: Vitalzeichen komplett
const skillVitalSigns: SkillTrainerSimulation = {
  id: 'skill_vital_signs',
  type: 'skill_trainer',
  titleKey: 'skills.vital_signs.title',
  descriptionKey: 'skills.vital_signs.description',
  steps: [
    {
      type: 'multiple_choice',
      instructionKey: 'skills.vital_signs.steps.step_01.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.vital_signs.steps.step_01.items.item_01' },
        { id: 'item_02', textKey: 'skills.vital_signs.steps.step_01.items.item_02' },
        { id: 'item_03', textKey: 'skills.vital_signs.steps.step_01.items.item_03' },
        { id: 'item_04', textKey: 'skills.vital_signs.steps.step_01.items.item_04' },
        { id: 'item_05', textKey: 'skills.vital_signs.steps.step_01.items.item_05' },
        { id: 'item_06', textKey: 'skills.vital_signs.steps.step_01.items.item_06' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_03', 'item_04', 'item_05'],
      feedbackCorrectKey: 'skills.vital_signs.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.vital_signs.steps.step_01.feedback_incorrect'
    },
    {
      type: 'single_choice',
      instructionKey: 'skills.vital_signs.steps.step_02.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.vital_signs.steps.step_02.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.vital_signs.steps.step_02.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.vital_signs.steps.step_02.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.vital_signs.steps.step_02.items.mc_04' }
      ],
      correctAnswer: 'mc_02',
      feedbackCorrectKey: 'skills.vital_signs.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.vital_signs.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 5: Körperpflege
const skillBodyCare: SkillTrainerSimulation = {
  id: 'skill_body_care',
  type: 'skill_trainer',
  titleKey: 'skills.body_care.title',
  descriptionKey: 'skills.body_care.description',
  steps: [
    {
      type: 'sequence',
      instructionKey: 'skills.body_care.steps.step_01.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.body_care.steps.step_01.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.body_care.steps.step_01.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.body_care.steps.step_01.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.body_care.steps.step_01.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.body_care.steps.step_01.items.seq_05' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05'],
      feedbackCorrectKey: 'skills.body_care.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.body_care.steps.step_01.feedback_incorrect'
    },
    {
      type: 'multiple_choice',
      instructionKey: 'skills.body_care.steps.step_02.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.body_care.steps.step_02.items.item_01' },
        { id: 'item_02', textKey: 'skills.body_care.steps.step_02.items.item_02' },
        { id: 'item_03', textKey: 'skills.body_care.steps.step_02.items.item_03' },
        { id: 'item_04', textKey: 'skills.body_care.steps.step_02.items.item_04' },
        { id: 'item_05', textKey: 'skills.body_care.steps.step_02.items.item_05' }
      ],
      correctAnswer: ['item_01', 'item_03', 'item_04'],
      feedbackCorrectKey: 'skills.body_care.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.body_care.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 6: Lagerung
const skillPositioning: SkillTrainerSimulation = {
  id: 'skill_positioning',
  type: 'skill_trainer',
  titleKey: 'skills.positioning.title',
  descriptionKey: 'skills.positioning.description',
  steps: [
    {
      type: 'single_choice',
      instructionKey: 'skills.positioning.steps.step_01.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.positioning.steps.step_01.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.positioning.steps.step_01.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.positioning.steps.step_01.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.positioning.steps.step_01.items.mc_04' }
      ],
      correctAnswer: 'mc_02',
      feedbackCorrectKey: 'skills.positioning.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.positioning.steps.step_01.feedback_incorrect'
    },
    {
      type: 'multiple_choice',
      instructionKey: 'skills.positioning.steps.step_02.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.positioning.steps.step_02.items.item_01' },
        { id: 'item_02', textKey: 'skills.positioning.steps.step_02.items.item_02' },
        { id: 'item_03', textKey: 'skills.positioning.steps.step_02.items.item_03' },
        { id: 'item_04', textKey: 'skills.positioning.steps.step_02.items.item_04' },
        { id: 'item_05', textKey: 'skills.positioning.steps.step_02.items.item_05' }
      ],
      correctAnswer: ['item_01', 'item_03', 'item_04'],
      feedbackCorrectKey: 'skills.positioning.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.positioning.steps.step_02.feedback_incorrect'
    }
  ]
};

// Praktische Skills - Teil 2: Medikamentengabe, Injektionen, Infusionen

// Skill 7: Intravenöse Medikamentengabe
const skillIVMedication: SkillTrainerSimulation = {
  id: 'skill_iv_medication',
  type: 'skill_trainer',
  titleKey: 'skills.iv_medication.title',
  descriptionKey: 'skills.iv_medication.description',
  steps: [
    {
      type: 'multiple_choice',
      instructionKey: 'skills.iv_medication.steps.step_01.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.iv_medication.steps.step_01.items.item_01' },
        { id: 'item_02', textKey: 'skills.iv_medication.steps.step_01.items.item_02' },
        { id: 'item_03', textKey: 'skills.iv_medication.steps.step_01.items.item_03' },
        { id: 'item_04', textKey: 'skills.iv_medication.steps.step_01.items.item_04' },
        { id: 'item_05', textKey: 'skills.iv_medication.steps.step_01.items.item_05' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_03', 'item_04'],
      feedbackCorrectKey: 'skills.iv_medication.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.iv_medication.steps.step_01.feedback_incorrect'
    },
    {
      type: 'sequence',
      instructionKey: 'skills.iv_medication.steps.step_02.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.iv_medication.steps.step_02.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.iv_medication.steps.step_02.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.iv_medication.steps.step_02.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.iv_medication.steps.step_02.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.iv_medication.steps.step_02.items.seq_05' },
        { id: 'seq_06', textKey: 'skills.iv_medication.steps.step_02.items.seq_06' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05', 'seq_06'],
      feedbackCorrectKey: 'skills.iv_medication.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.iv_medication.steps.step_02.feedback_incorrect'
    },
    {
      type: 'single_choice',
      instructionKey: 'skills.iv_medication.steps.step_03.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.iv_medication.steps.step_03.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.iv_medication.steps.step_03.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.iv_medication.steps.step_03.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.iv_medication.steps.step_03.items.mc_04' }
      ],
      correctAnswer: 'mc_02',
      feedbackCorrectKey: 'skills.iv_medication.steps.step_03.feedback_correct',
      feedbackIncorrectKey: 'skills.iv_medication.steps.step_03.feedback_incorrect'
    }
  ]
};

// Skill 8: Intramuskuläre Injektion
const skillIMInjection: SkillTrainerSimulation = {
  id: 'skill_im_injection',
  type: 'skill_trainer',
  titleKey: 'skills.im_injection.title',
  descriptionKey: 'skills.im_injection.description',
  steps: [
    {
      type: 'single_choice',
      instructionKey: 'skills.im_injection.steps.step_01.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.im_injection.steps.step_01.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.im_injection.steps.step_01.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.im_injection.steps.step_01.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.im_injection.steps.step_01.items.mc_04' }
      ],
      correctAnswer: 'mc_03',
      feedbackCorrectKey: 'skills.im_injection.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.im_injection.steps.step_01.feedback_incorrect'
    },
    {
      type: 'sequence',
      instructionKey: 'skills.im_injection.steps.step_02.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.im_injection.steps.step_02.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.im_injection.steps.step_02.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.im_injection.steps.step_02.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.im_injection.steps.step_02.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.im_injection.steps.step_02.items.seq_05' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05'],
      feedbackCorrectKey: 'skills.im_injection.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.im_injection.steps.step_02.feedback_incorrect'
    },
    {
      type: 'multiple_choice',
      instructionKey: 'skills.im_injection.steps.step_03.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.im_injection.steps.step_03.items.item_01' },
        { id: 'item_02', textKey: 'skills.im_injection.steps.step_03.items.item_02' },
        { id: 'item_03', textKey: 'skills.im_injection.steps.step_03.items.item_03' },
        { id: 'item_04', textKey: 'skills.im_injection.steps.step_03.items.item_04' },
        { id: 'item_05', textKey: 'skills.im_injection.steps.step_03.items.item_05' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_04'],
      feedbackCorrectKey: 'skills.im_injection.steps.step_03.feedback_correct',
      feedbackIncorrectKey: 'skills.im_injection.steps.step_03.feedback_incorrect'
    }
  ]
};

// Skill 9: Infusionstherapie
const skillInfusionTherapy: SkillTrainerSimulation = {
  id: 'skill_infusion_therapy',
  type: 'skill_trainer',
  titleKey: 'skills.infusion_therapy.title',
  descriptionKey: 'skills.infusion_therapy.description',
  steps: [
    {
      type: 'sequence',
      instructionKey: 'skills.infusion_therapy.steps.step_01.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.infusion_therapy.steps.step_01.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.infusion_therapy.steps.step_01.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.infusion_therapy.steps.step_01.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.infusion_therapy.steps.step_01.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.infusion_therapy.steps.step_01.items.seq_05' },
        { id: 'seq_06', textKey: 'skills.infusion_therapy.steps.step_01.items.seq_06' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05', 'seq_06'],
      feedbackCorrectKey: 'skills.infusion_therapy.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.infusion_therapy.steps.step_01.feedback_incorrect'
    },
    {
      type: 'single_choice',
      instructionKey: 'skills.infusion_therapy.steps.step_02.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.infusion_therapy.steps.step_02.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.infusion_therapy.steps.step_02.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.infusion_therapy.steps.step_02.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.infusion_therapy.steps.step_02.items.mc_04' }
      ],
      correctAnswer: 'mc_03',
      feedbackCorrectKey: 'skills.infusion_therapy.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.infusion_therapy.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 10: Medikamentensicherheit
const skillMedicationSafety: SkillTrainerSimulation = {
  id: 'skill_medication_safety',
  type: 'skill_trainer',
  titleKey: 'skills.medication_safety.title',
  descriptionKey: 'skills.medication_safety.description',
  steps: [
    {
      type: 'multiple_choice',
      instructionKey: 'skills.medication_safety.steps.step_01.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.medication_safety.steps.step_01.items.item_01' },
        { id: 'item_02', textKey: 'skills.medication_safety.steps.step_01.items.item_02' },
        { id: 'item_03', textKey: 'skills.medication_safety.steps.step_01.items.item_03' },
        { id: 'item_04', textKey: 'skills.medication_safety.steps.step_01.items.item_04' },
        { id: 'item_05', textKey: 'skills.medication_safety.steps.step_01.items.item_05' },
        { id: 'item_06', textKey: 'skills.medication_safety.steps.step_01.items.item_06' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_03', 'item_04', 'item_05'],
      feedbackCorrectKey: 'skills.medication_safety.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.medication_safety.steps.step_01.feedback_incorrect'
    },
    {
      type: 'single_choice',
      instructionKey: 'skills.medication_safety.steps.step_02.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.medication_safety.steps.step_02.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.medication_safety.steps.step_02.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.medication_safety.steps.step_02.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.medication_safety.steps.step_02.items.mc_04' }
      ],
      correctAnswer: 'mc_01',
      feedbackCorrectKey: 'skills.medication_safety.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.medication_safety.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 11: Insulin-Injektion
const skillInsulinInjection: SkillTrainerSimulation = {
  id: 'skill_insulin_injection',
  type: 'skill_trainer',
  titleKey: 'skills.insulin_injection.title',
  descriptionKey: 'skills.insulin_injection.description',
  steps: [
    {
      type: 'sequence',
      instructionKey: 'skills.insulin_injection.steps.step_01.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.insulin_injection.steps.step_01.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.insulin_injection.steps.step_01.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.insulin_injection.steps.step_01.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.insulin_injection.steps.step_01.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.insulin_injection.steps.step_01.items.seq_05' },
        { id: 'seq_06', textKey: 'skills.insulin_injection.steps.step_01.items.seq_06' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05', 'seq_06'],
      feedbackCorrectKey: 'skills.insulin_injection.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.insulin_injection.steps.step_01.feedback_incorrect'
    },
    {
      type: 'single_choice',
      instructionKey: 'skills.insulin_injection.steps.step_02.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.insulin_injection.steps.step_02.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.insulin_injection.steps.step_02.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.insulin_injection.steps.step_02.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.insulin_injection.steps.step_02.items.mc_04' }
      ],
      correctAnswer: 'mc_02',
      feedbackCorrectKey: 'skills.insulin_injection.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.insulin_injection.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 12: Medikamentenvorbereitung
const skillMedicationPreparation: SkillTrainerSimulation = {
  id: 'skill_medication_preparation',
  type: 'skill_trainer',
  titleKey: 'skills.medication_preparation.title',
  descriptionKey: 'skills.medication_preparation.description',
  steps: [
    {
      type: 'multiple_choice',
      instructionKey: 'skills.medication_preparation.steps.step_01.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.medication_preparation.steps.step_01.items.item_01' },
        { id: 'item_02', textKey: 'skills.medication_preparation.steps.step_01.items.item_02' },
        { id: 'item_03', textKey: 'skills.medication_preparation.steps.step_01.items.item_03' },
        { id: 'item_04', textKey: 'skills.medication_preparation.steps.step_01.items.item_04' },
        { id: 'item_05', textKey: 'skills.medication_preparation.steps.step_01.items.item_05' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_04', 'item_05'],
      feedbackCorrectKey: 'skills.medication_preparation.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.medication_preparation.steps.step_01.feedback_incorrect'
    },
    {
      type: 'sequence',
      instructionKey: 'skills.medication_preparation.steps.step_02.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.medication_preparation.steps.step_02.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.medication_preparation.steps.step_02.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.medication_preparation.steps.step_02.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.medication_preparation.steps.step_02.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.medication_preparation.steps.step_02.items.seq_05' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05'],
      feedbackCorrectKey: 'skills.medication_preparation.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.medication_preparation.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 13: Venöse Zugänge
const skillVenousAccess: SkillTrainerSimulation = {
  id: 'skill_venous_access',
  type: 'skill_trainer',
  titleKey: 'skills.venous_access.title',
  descriptionKey: 'skills.venous_access.description',
  steps: [
    {
      type: 'single_choice',
      instructionKey: 'skills.venous_access.steps.step_01.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.venous_access.steps.step_01.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.venous_access.steps.step_01.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.venous_access.steps.step_01.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.venous_access.steps.step_01.items.mc_04' }
      ],
      correctAnswer: 'mc_01',
      feedbackCorrectKey: 'skills.venous_access.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.venous_access.steps.step_01.feedback_incorrect'
    },
    {
      type: 'sequence',
      instructionKey: 'skills.venous_access.steps.step_02.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.venous_access.steps.step_02.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.venous_access.steps.step_02.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.venous_access.steps.step_02.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.venous_access.steps.step_02.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.venous_access.steps.step_02.items.seq_05' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05'],
      feedbackCorrectKey: 'skills.venous_access.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.venous_access.steps.step_02.feedback_incorrect'
    },
    {
      type: 'multiple_choice',
      instructionKey: 'skills.venous_access.steps.step_03.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.venous_access.steps.step_03.items.item_01' },
        { id: 'item_02', textKey: 'skills.venous_access.steps.step_03.items.item_02' },
        { id: 'item_03', textKey: 'skills.venous_access.steps.step_03.items.item_03' },
        { id: 'item_04', textKey: 'skills.venous_access.steps.step_03.items.item_04' },
        { id: 'item_05', textKey: 'skills.venous_access.steps.step_03.items.item_05' }
      ],
      correctAnswer: ['item_01', 'item_03', 'item_05'],
      feedbackCorrectKey: 'skills.venous_access.steps.step_03.feedback_correct',
      feedbackIncorrectKey: 'skills.venous_access.steps.step_03.feedback_incorrect'
    }
  ]
};

// Skill 14: Medikamentendokumentation
const skillMedicationDocumentation: SkillTrainerSimulation = {
  id: 'skill_medication_documentation',
  type: 'skill_trainer',
  titleKey: 'skills.medication_documentation.title',
  descriptionKey: 'skills.medication_documentation.description',
  steps: [
    {
      type: 'multiple_choice',
      instructionKey: 'skills.medication_documentation.steps.step_01.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.medication_documentation.steps.step_01.items.item_01' },
        { id: 'item_02', textKey: 'skills.medication_documentation.steps.step_01.items.item_02' },
        { id: 'item_03', textKey: 'skills.medication_documentation.steps.step_01.items.item_03' },
        { id: 'item_04', textKey: 'skills.medication_documentation.steps.step_01.items.item_04' },
        { id: 'item_05', textKey: 'skills.medication_documentation.steps.step_01.items.item_05' },
        { id: 'item_06', textKey: 'skills.medication_documentation.steps.step_01.items.item_06' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_03', 'item_04', 'item_05'],
      feedbackCorrectKey: 'skills.medication_documentation.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.medication_documentation.steps.step_01.feedback_incorrect'
    },
    {
      type: 'single_choice',
      instructionKey: 'skills.medication_documentation.steps.step_02.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.medication_documentation.steps.step_02.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.medication_documentation.steps.step_02.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.medication_documentation.steps.step_02.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.medication_documentation.steps.step_02.items.mc_04' }
      ],
      correctAnswer: 'mc_02',
      feedbackCorrectKey: 'skills.medication_documentation.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.medication_documentation.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 15: Notfallmedikamente
const skillEmergencyMedication: SkillTrainerSimulation = {
  id: 'skill_emergency_medication',
  type: 'skill_trainer',
  titleKey: 'skills.emergency_medication.title',
  descriptionKey: 'skills.emergency_medication.description',
  steps: [
    {
      type: 'single_choice',
      instructionKey: 'skills.emergency_medication.steps.step_01.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.emergency_medication.steps.step_01.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.emergency_medication.steps.step_01.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.emergency_medication.steps.step_01.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.emergency_medication.steps.step_01.items.mc_04' }
      ],
      correctAnswer: 'mc_01',
      feedbackCorrectKey: 'skills.emergency_medication.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.emergency_medication.steps.step_01.feedback_incorrect'
    },
    {
      type: 'multiple_choice',
      instructionKey: 'skills.emergency_medication.steps.step_02.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.emergency_medication.steps.step_02.items.item_01' },
        { id: 'item_02', textKey: 'skills.emergency_medication.steps.step_02.items.item_02' },
        { id: 'item_03', textKey: 'skills.emergency_medication.steps.step_02.items.item_03' },
        { id: 'item_04', textKey: 'skills.emergency_medication.steps.step_02.items.item_04' },
        { id: 'item_05', textKey: 'skills.emergency_medication.steps.step_02.items.item_05' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_03', 'item_04'],
      feedbackCorrectKey: 'skills.emergency_medication.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.emergency_medication.steps.step_02.feedback_incorrect'
    },
    {
      type: 'sequence',
      instructionKey: 'skills.emergency_medication.steps.step_03.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.emergency_medication.steps.step_03.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.emergency_medication.steps.step_03.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.emergency_medication.steps.step_03.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.emergency_medication.steps.step_03.items.seq_04' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04'],
      feedbackCorrectKey: 'skills.emergency_medication.steps.step_03.feedback_correct',
      feedbackIncorrectKey: 'skills.emergency_medication.steps.step_03.feedback_incorrect'
    }
  ]
};

// Skill 16: Medikamenteninteraktionen
const skillDrugInteractions: SkillTrainerSimulation = {
  id: 'skill_drug_interactions',
  type: 'skill_trainer',
  titleKey: 'skills.drug_interactions.title',
  descriptionKey: 'skills.drug_interactions.description',
  steps: [
    {
      type: 'single_choice',
      instructionKey: 'skills.drug_interactions.steps.step_01.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.drug_interactions.steps.step_01.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.drug_interactions.steps.step_01.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.drug_interactions.steps.step_01.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.drug_interactions.steps.step_01.items.mc_04' }
      ],
      correctAnswer: 'mc_02',
      feedbackCorrectKey: 'skills.drug_interactions.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.drug_interactions.steps.step_01.feedback_incorrect'
    },
    {
      type: 'multiple_choice',
      instructionKey: 'skills.drug_interactions.steps.step_02.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.drug_interactions.steps.step_02.items.item_01' },
        { id: 'item_02', textKey: 'skills.drug_interactions.steps.step_02.items.item_02' },
        { id: 'item_03', textKey: 'skills.drug_interactions.steps.step_02.items.item_03' },
        { id: 'item_04', textKey: 'skills.drug_interactions.steps.step_02.items.item_04' },
        { id: 'item_05', textKey: 'skills.drug_interactions.steps.step_02.items.item_05' }
      ],
      correctAnswer: ['item_01', 'item_03', 'item_04'],
      feedbackCorrectKey: 'skills.drug_interactions.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.drug_interactions.steps.step_02.feedback_incorrect'
    }
  ]
};

// Praktische Skills - Teil 3: Wundversorgung, Notfallmaßnahmen, Dokumentation

// Skill 17: Wundversorgung und Verbandswechsel
const skillWoundCare: SkillTrainerSimulation = {
  id: 'skill_wound_care',
  type: 'skill_trainer',
  titleKey: 'skills.wound_care.title',
  descriptionKey: 'skills.wound_care.description',
  steps: [
    {
      type: 'sequence',
      instructionKey: 'skills.wound_care.steps.step_01.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.wound_care.steps.step_01.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.wound_care.steps.step_01.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.wound_care.steps.step_01.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.wound_care.steps.step_01.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.wound_care.steps.step_01.items.seq_05' },
        { id: 'seq_06', textKey: 'skills.wound_care.steps.step_01.items.seq_06' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05', 'seq_06'],
      feedbackCorrectKey: 'skills.wound_care.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.wound_care.steps.step_01.feedback_incorrect'
    },
    {
      type: 'single_choice',
      instructionKey: 'skills.wound_care.steps.step_02.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.wound_care.steps.step_02.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.wound_care.steps.step_02.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.wound_care.steps.step_02.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.wound_care.steps.step_02.items.mc_04' }
      ],
      correctAnswer: 'mc_02',
      feedbackCorrectKey: 'skills.wound_care.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.wound_care.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 18: Herz-Lungen-Wiederbelebung (CPR)
const skillCPR: SkillTrainerSimulation = {
  id: 'skill_cpr',
  type: 'skill_trainer',
  titleKey: 'skills.cpr.title',
  descriptionKey: 'skills.cpr.description',
  steps: [
    {
      type: 'single_choice',
      instructionKey: 'skills.cpr.steps.step_01.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.cpr.steps.step_01.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.cpr.steps.step_01.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.cpr.steps.step_01.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.cpr.steps.step_01.items.mc_04' }
      ],
      correctAnswer: 'mc_03',
      feedbackCorrectKey: 'skills.cpr.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.cpr.steps.step_01.feedback_incorrect'
    },
    {
      type: 'sequence',
      instructionKey: 'skills.cpr.steps.step_02.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.cpr.steps.step_02.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.cpr.steps.step_02.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.cpr.steps.step_02.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.cpr.steps.step_02.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.cpr.steps.step_02.items.seq_05' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05'],
      feedbackCorrectKey: 'skills.cpr.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.cpr.steps.step_02.feedback_incorrect'
    },
    {
      type: 'single_choice',
      instructionKey: 'skills.cpr.steps.step_03.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.cpr.steps.step_03.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.cpr.steps.step_03.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.cpr.steps.step_03.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.cpr.steps.step_03.items.mc_04' }
      ],
      correctAnswer: 'mc_01',
      feedbackCorrectKey: 'skills.cpr.steps.step_03.feedback_correct',
      feedbackIncorrectKey: 'skills.cpr.steps.step_03.feedback_incorrect'
    }
  ]
};

// Skill 19: Erstversorgung von Verletzungen
const skillFirstAid: SkillTrainerSimulation = {
  id: 'skill_first_aid',
  type: 'skill_trainer',
  titleKey: 'skills.first_aid.title',
  descriptionKey: 'skills.first_aid.description',
  steps: [
    {
      type: 'multiple_choice',
      instructionKey: 'skills.first_aid.steps.step_01.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.first_aid.steps.step_01.items.item_01' },
        { id: 'item_02', textKey: 'skills.first_aid.steps.step_01.items.item_02' },
        { id: 'item_03', textKey: 'skills.first_aid.steps.step_01.items.item_03' },
        { id: 'item_04', textKey: 'skills.first_aid.steps.step_01.items.item_04' },
        { id: 'item_05', textKey: 'skills.first_aid.steps.step_01.items.item_05' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_04'],
      feedbackCorrectKey: 'skills.first_aid.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.first_aid.steps.step_01.feedback_incorrect'
    },
    {
      type: 'single_choice',
      instructionKey: 'skills.first_aid.steps.step_02.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.first_aid.steps.step_02.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.first_aid.steps.step_02.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.first_aid.steps.step_02.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.first_aid.steps.step_02.items.mc_04' }
      ],
      correctAnswer: 'mc_02',
      feedbackCorrectKey: 'skills.first_aid.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.first_aid.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 20: Pflege-Dokumentation
const skillNursingDocumentation: SkillTrainerSimulation = {
  id: 'skill_nursing_documentation',
  type: 'skill_trainer',
  titleKey: 'skills.nursing_documentation.title',
  descriptionKey: 'skills.nursing_documentation.description',
  steps: [
    {
      type: 'multiple_choice',
      instructionKey: 'skills.nursing_documentation.steps.step_01.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.nursing_documentation.steps.step_01.items.item_01' },
        { id: 'item_02', textKey: 'skills.nursing_documentation.steps.step_01.items.item_02' },
        { id: 'item_03', textKey: 'skills.nursing_documentation.steps.step_01.items.item_03' },
        { id: 'item_04', textKey: 'skills.nursing_documentation.steps.step_01.items.item_04' },
        { id: 'item_05', textKey: 'skills.nursing_documentation.steps.step_01.items.item_05' },
        { id: 'item_06', textKey: 'skills.nursing_documentation.steps.step_01.items.item_06' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_03', 'item_05'],
      feedbackCorrectKey: 'skills.nursing_documentation.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.nursing_documentation.steps.step_01.feedback_incorrect'
    },
    {
      type: 'single_choice',
      instructionKey: 'skills.nursing_documentation.steps.step_02.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.nursing_documentation.steps.step_02.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.nursing_documentation.steps.step_02.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.nursing_documentation.steps.step_02.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.nursing_documentation.steps.step_02.items.mc_04' }
      ],
      correctAnswer: 'mc_03',
      feedbackCorrectKey: 'skills.nursing_documentation.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.nursing_documentation.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 21: Katheterpflege
const skillCatheterCare: SkillTrainerSimulation = {
  id: 'skill_catheter_care',
  type: 'skill_trainer',
  titleKey: 'skills.catheter_care.title',
  descriptionKey: 'skills.catheter_care.description',
  steps: [
    {
      type: 'sequence',
      instructionKey: 'skills.catheter_care.steps.step_01.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.catheter_care.steps.step_01.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.catheter_care.steps.step_01.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.catheter_care.steps.step_01.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.catheter_care.steps.step_01.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.catheter_care.steps.step_01.items.seq_05' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05'],
      feedbackCorrectKey: 'skills.catheter_care.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.catheter_care.steps.step_01.feedback_incorrect'
    },
    {
      type: 'multiple_choice',
      instructionKey: 'skills.catheter_care.steps.step_02.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.catheter_care.steps.step_02.items.item_01' },
        { id: 'item_02', textKey: 'skills.catheter_care.steps.step_02.items.item_02' },
        { id: 'item_03', textKey: 'skills.catheter_care.steps.step_02.items.item_03' },
        { id: 'item_04', textKey: 'skills.catheter_care.steps.step_02.items.item_04' },
        { id: 'item_05', textKey: 'skills.catheter_care.steps.step_02.items.item_05' }
      ],
      correctAnswer: ['item_01', 'item_03', 'item_04'],
      feedbackCorrectKey: 'skills.catheter_care.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.catheter_care.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 22: Notfall-Triage
const skillEmergencyTriage: SkillTrainerSimulation = {
  id: 'skill_emergency_triage',
  type: 'skill_trainer',
  titleKey: 'skills.emergency_triage.title',
  descriptionKey: 'skills.emergency_triage.description',
  steps: [
    {
      type: 'single_choice',
      instructionKey: 'skills.emergency_triage.steps.step_01.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.emergency_triage.steps.step_01.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.emergency_triage.steps.step_01.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.emergency_triage.steps.step_01.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.emergency_triage.steps.step_01.items.mc_04' }
      ],
      correctAnswer: 'mc_01',
      feedbackCorrectKey: 'skills.emergency_triage.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.emergency_triage.steps.step_01.feedback_incorrect'
    },
    {
      type: 'multiple_choice',
      instructionKey: 'skills.emergency_triage.steps.step_02.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.emergency_triage.steps.step_02.items.item_01' },
        { id: 'item_02', textKey: 'skills.emergency_triage.steps.step_02.items.item_02' },
        { id: 'item_03', textKey: 'skills.emergency_triage.steps.step_02.items.item_03' },
        { id: 'item_04', textKey: 'skills.emergency_triage.steps.step_02.items.item_04' },
        { id: 'item_05', textKey: 'skills.emergency_triage.steps.step_02.items.item_05' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_03'],
      feedbackCorrectKey: 'skills.emergency_triage.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.emergency_triage.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 23: Sauerstofftherapie
const skillOxygenTherapy: SkillTrainerSimulation = {
  id: 'skill_oxygen_therapy',
  type: 'skill_trainer',
  titleKey: 'skills.oxygen_therapy.title',
  descriptionKey: 'skills.oxygen_therapy.description',
  steps: [
    {
      type: 'single_choice',
      instructionKey: 'skills.oxygen_therapy.steps.step_01.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.oxygen_therapy.steps.step_01.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.oxygen_therapy.steps.step_01.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.oxygen_therapy.steps.step_01.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.oxygen_therapy.steps.step_01.items.mc_04' }
      ],
      correctAnswer: 'mc_02',
      feedbackCorrectKey: 'skills.oxygen_therapy.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.oxygen_therapy.steps.step_01.feedback_incorrect'
    },
    {
      type: 'sequence',
      instructionKey: 'skills.oxygen_therapy.steps.step_02.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.oxygen_therapy.steps.step_02.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.oxygen_therapy.steps.step_02.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.oxygen_therapy.steps.step_02.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.oxygen_therapy.steps.step_02.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.oxygen_therapy.steps.step_02.items.seq_05' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05'],
      feedbackCorrectKey: 'skills.oxygen_therapy.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.oxygen_therapy.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 24: Pflegeplanung
const skillCarePlanning: SkillTrainerSimulation = {
  id: 'skill_care_planning',
  type: 'skill_trainer',
  titleKey: 'skills.care_planning.title',
  descriptionKey: 'skills.care_planning.description',
  steps: [
    {
      type: 'sequence',
      instructionKey: 'skills.care_planning.steps.step_01.instruction',
      items: [
        { id: 'seq_01', textKey: 'skills.care_planning.steps.step_01.items.seq_01' },
        { id: 'seq_02', textKey: 'skills.care_planning.steps.step_01.items.seq_02' },
        { id: 'seq_03', textKey: 'skills.care_planning.steps.step_01.items.seq_03' },
        { id: 'seq_04', textKey: 'skills.care_planning.steps.step_01.items.seq_04' },
        { id: 'seq_05', textKey: 'skills.care_planning.steps.step_01.items.seq_05' }
      ],
      correctAnswer: ['seq_01', 'seq_02', 'seq_03', 'seq_04', 'seq_05'],
      feedbackCorrectKey: 'skills.care_planning.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.care_planning.steps.step_01.feedback_incorrect'
    },
    {
      type: 'multiple_choice',
      instructionKey: 'skills.care_planning.steps.step_02.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.care_planning.steps.step_02.items.item_01' },
        { id: 'item_02', textKey: 'skills.care_planning.steps.step_02.items.item_02' },
        { id: 'item_03', textKey: 'skills.care_planning.steps.step_02.items.item_03' },
        { id: 'item_04', textKey: 'skills.care_planning.steps.step_02.items.item_04' },
        { id: 'item_05', textKey: 'skills.care_planning.steps.step_02.items.item_05' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_04'],
      feedbackCorrectKey: 'skills.care_planning.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.care_planning.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 25: Schmerzassessment
const skillPainAssessment: SkillTrainerSimulation = {
  id: 'skill_pain_assessment',
  type: 'skill_trainer',
  titleKey: 'skills.pain_assessment.title',
  descriptionKey: 'skills.pain_assessment.description',
  steps: [
    {
      type: 'single_choice',
      instructionKey: 'skills.pain_assessment.steps.step_01.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.pain_assessment.steps.step_01.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.pain_assessment.steps.step_01.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.pain_assessment.steps.step_01.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.pain_assessment.steps.step_01.items.mc_04' }
      ],
      correctAnswer: 'mc_03',
      feedbackCorrectKey: 'skills.pain_assessment.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.pain_assessment.steps.step_01.feedback_incorrect'
    },
    {
      type: 'multiple_choice',
      instructionKey: 'skills.pain_assessment.steps.step_02.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.pain_assessment.steps.step_02.items.item_01' },
        { id: 'item_02', textKey: 'skills.pain_assessment.steps.step_02.items.item_02' },
        { id: 'item_03', textKey: 'skills.pain_assessment.steps.step_02.items.item_03' },
        { id: 'item_04', textKey: 'skills.pain_assessment.steps.step_02.items.item_04' },
        { id: 'item_05', textKey: 'skills.pain_assessment.steps.step_02.items.item_05' },
        { id: 'item_06', textKey: 'skills.pain_assessment.steps.step_02.items.item_06' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_03', 'item_04', 'item_05'],
      feedbackCorrectKey: 'skills.pain_assessment.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.pain_assessment.steps.step_02.feedback_incorrect'
    }
  ]
};

// Skill 26: Sturz-Risikobewertung
const skillFallRiskAssessment: SkillTrainerSimulation = {
  id: 'skill_fall_risk_assessment',
  type: 'skill_trainer',
  titleKey: 'skills.fall_risk_assessment.title',
  descriptionKey: 'skills.fall_risk_assessment.description',
  steps: [
    {
      type: 'multiple_choice',
      instructionKey: 'skills.fall_risk_assessment.steps.step_01.instruction',
      items: [
        { id: 'item_01', textKey: 'skills.fall_risk_assessment.steps.step_01.items.item_01' },
        { id: 'item_02', textKey: 'skills.fall_risk_assessment.steps.step_01.items.item_02' },
        { id: 'item_03', textKey: 'skills.fall_risk_assessment.steps.step_01.items.item_03' },
        { id: 'item_04', textKey: 'skills.fall_risk_assessment.steps.step_01.items.item_04' },
        { id: 'item_05', textKey: 'skills.fall_risk_assessment.steps.step_01.items.item_05' },
        { id: 'item_06', textKey: 'skills.fall_risk_assessment.steps.step_01.items.item_06' }
      ],
      correctAnswer: ['item_01', 'item_02', 'item_03', 'item_05'],
      feedbackCorrectKey: 'skills.fall_risk_assessment.steps.step_01.feedback_correct',
      feedbackIncorrectKey: 'skills.fall_risk_assessment.steps.step_01.feedback_incorrect'
    },
    {
      type: 'single_choice',
      instructionKey: 'skills.fall_risk_assessment.steps.step_02.instruction',
      items: [
        { id: 'mc_01', textKey: 'skills.fall_risk_assessment.steps.step_02.items.mc_01' },
        { id: 'mc_02', textKey: 'skills.fall_risk_assessment.steps.step_02.items.mc_02' },
        { id: 'mc_03', textKey: 'skills.fall_risk_assessment.steps.step_02.items.mc_03' },
        { id: 'mc_04', textKey: 'skills.fall_risk_assessment.steps.step_02.items.mc_04' }
      ],
      correctAnswer: 'mc_02',
      feedbackCorrectKey: 'skills.fall_risk_assessment.steps.step_02.feedback_correct',
      feedbackIncorrectKey: 'skills.fall_risk_assessment.steps.step_02.feedback_incorrect'
    }
  ]
};

// Weitere realistische Fälle - Teil 2: Geriatrie, Pädiatrie, Neurologie

// Fall 11: Sturz bei Demenz-Patient
const caseFallDementia: DecisionTreeSimulation = {
  id: 'case_fall_dementia',
  type: 'decision_tree',
  titleKey: 'cases.fall_dementia.title',
  descriptionKey: 'cases.fall_dementia.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.fall_dementia.nodes.node_01.text',
      choices: [
        { textKey: 'cases.fall_dementia.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.fall_dementia.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.fall_dementia.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.fall_dementia.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.fall_dementia.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.fall_dementia.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.fall_dementia.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.fall_dementia.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.fall_dementia.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.fall_dementia.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.fall_dementia.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.fall_dementia.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.fall_dementia.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.fall_dementia.nodes.node_03b.feedback'
    }
  }
};

// Fall 12: Delir vs. Demenz
const caseDelirVsDementia: DecisionTreeSimulation = {
  id: 'case_delir_dementia',
  type: 'decision_tree',
  titleKey: 'cases.delir_dementia.title',
  descriptionKey: 'cases.delir_dementia.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.delir_dementia.nodes.node_01.text',
      choices: [
        { textKey: 'cases.delir_dementia.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.delir_dementia.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.delir_dementia.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.delir_dementia.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.delir_dementia.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.delir_dementia.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.delir_dementia.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.delir_dementia.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.delir_dementia.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.delir_dementia.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.delir_dementia.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.delir_dementia.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.delir_dementia.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.delir_dementia.nodes.node_03b.feedback'
    }
  }
};

// Fall 13: Fieberkrampf bei Kleinkind
const caseFebrileSeizure: DecisionTreeSimulation = {
  id: 'case_febrile_seizure',
  type: 'decision_tree',
  titleKey: 'cases.febrile_seizure.title',
  descriptionKey: 'cases.febrile_seizure.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.febrile_seizure.nodes.node_01.text',
      choices: [
        { textKey: 'cases.febrile_seizure.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.febrile_seizure.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.febrile_seizure.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.febrile_seizure.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.febrile_seizure.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.febrile_seizure.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.febrile_seizure.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.febrile_seizure.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.febrile_seizure.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.febrile_seizure.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.febrile_seizure.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.febrile_seizure.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.febrile_seizure.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.febrile_seizure.nodes.node_03b.feedback'
    }
  }
};

// Fall 14: Dehydratation bei Säugling
const caseInfantDehydration: DecisionTreeSimulation = {
  id: 'case_infant_dehydration',
  type: 'decision_tree',
  titleKey: 'cases.infant_dehydration.title',
  descriptionKey: 'cases.infant_dehydration.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.infant_dehydration.nodes.node_01.text',
      choices: [
        { textKey: 'cases.infant_dehydration.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.infant_dehydration.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.infant_dehydration.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.infant_dehydration.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.infant_dehydration.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.infant_dehydration.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.infant_dehydration.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.infant_dehydration.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.infant_dehydration.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.infant_dehydration.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.infant_dehydration.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.infant_dehydration.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.infant_dehydration.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.infant_dehydration.nodes.node_03b.feedback'
    }
  }
};

// Fall 15: Asthmaanfall bei Kind
const caseChildAsthma: DecisionTreeSimulation = {
  id: 'case_child_asthma',
  type: 'decision_tree',
  titleKey: 'cases.child_asthma.title',
  descriptionKey: 'cases.child_asthma.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.child_asthma.nodes.node_01.text',
      choices: [
        { textKey: 'cases.child_asthma.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.child_asthma.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.child_asthma.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.child_asthma.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.child_asthma.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.child_asthma.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.child_asthma.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.child_asthma.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.child_asthma.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.child_asthma.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.child_asthma.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.child_asthma.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.child_asthma.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.child_asthma.nodes.node_03b.feedback'
    }
  }
};

// Fall 16: Multiple Sklerose Schub
const caseMSRelapse: DecisionTreeSimulation = {
  id: 'case_ms_relapse',
  type: 'decision_tree',
  titleKey: 'cases.ms_relapse.title',
  descriptionKey: 'cases.ms_relapse.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.ms_relapse.nodes.node_01.text',
      choices: [
        { textKey: 'cases.ms_relapse.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.ms_relapse.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.ms_relapse.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.ms_relapse.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.ms_relapse.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.ms_relapse.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.ms_relapse.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.ms_relapse.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.ms_relapse.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.ms_relapse.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.ms_relapse.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.ms_relapse.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.ms_relapse.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.ms_relapse.nodes.node_03b.feedback'
    }
  }
};

// Fall 17: Epileptischer Anfall
const caseEpilepticSeizure: DecisionTreeSimulation = {
  id: 'case_epileptic_seizure',
  type: 'decision_tree',
  titleKey: 'cases.epileptic_seizure.title',
  descriptionKey: 'cases.epileptic_seizure.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.epileptic_seizure.nodes.node_01.text',
      choices: [
        { textKey: 'cases.epileptic_seizure.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.epileptic_seizure.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.epileptic_seizure.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.epileptic_seizure.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.epileptic_seizure.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.epileptic_seizure.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.epileptic_seizure.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.epileptic_seizure.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.epileptic_seizure.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.epileptic_seizure.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.epileptic_seizure.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.epileptic_seizure.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.epileptic_seizure.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.epileptic_seizure.nodes.node_03b.feedback'
    }
  }
};

// Fall 18: Parkinson Symptom-Management
const caseParkinsonSymptoms: DecisionTreeSimulation = {
  id: 'case_parkinson_symptoms',
  type: 'decision_tree',
  titleKey: 'cases.parkinson_symptoms.title',
  descriptionKey: 'cases.parkinson_symptoms.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.parkinson_symptoms.nodes.node_01.text',
      choices: [
        { textKey: 'cases.parkinson_symptoms.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.parkinson_symptoms.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.parkinson_symptoms.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.parkinson_symptoms.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.parkinson_symptoms.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.parkinson_symptoms.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.parkinson_symptoms.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.parkinson_symptoms.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.parkinson_symptoms.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.parkinson_symptoms.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.parkinson_symptoms.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.parkinson_symptoms.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.parkinson_symptoms.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.parkinson_symptoms.nodes.node_03b.feedback'
    }
  }
};

// Fall 19: Polypharmazie im Alter
const casePolypharmacy: DecisionTreeSimulation = {
  id: 'case_polypharmacy',
  type: 'decision_tree',
  titleKey: 'cases.polypharmacy.title',
  descriptionKey: 'cases.polypharmacy.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.polypharmacy.nodes.node_01.text',
      choices: [
        { textKey: 'cases.polypharmacy.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.polypharmacy.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.polypharmacy.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.polypharmacy.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.polypharmacy.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.polypharmacy.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.polypharmacy.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.polypharmacy.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.polypharmacy.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.polypharmacy.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.polypharmacy.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.polypharmacy.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.polypharmacy.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.polypharmacy.nodes.node_03b.feedback'
    }
  }
};

// Fall 20: Malnutrition im Alter
const caseMalnutrition: DecisionTreeSimulation = {
  id: 'case_malnutrition',
  type: 'decision_tree',
  titleKey: 'cases.malnutrition.title',
  descriptionKey: 'cases.malnutrition.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.malnutrition.nodes.node_01.text',
      choices: [
        { textKey: 'cases.malnutrition.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.malnutrition.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.malnutrition.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.malnutrition.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.malnutrition.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.malnutrition.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.malnutrition.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.malnutrition.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.malnutrition.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.malnutrition.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.malnutrition.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.malnutrition.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.malnutrition.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.malnutrition.nodes.node_03b.feedback'
    }
  }
};

// Weitere realistische Fälle - Teil 3: Psychiatrie, Onkologie, Palliativmedizin

// Fall 21: Akute Suizidalität
const caseSuicidalCrisis: DecisionTreeSimulation = {
  id: 'case_suicidal_crisis',
  type: 'decision_tree',
  titleKey: 'cases.suicidal_crisis.title',
  descriptionKey: 'cases.suicidal_crisis.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.suicidal_crisis.nodes.node_01.text',
      choices: [
        { textKey: 'cases.suicidal_crisis.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.suicidal_crisis.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.suicidal_crisis.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.suicidal_crisis.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.suicidal_crisis.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.suicidal_crisis.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.suicidal_crisis.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.suicidal_crisis.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.suicidal_crisis.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.suicidal_crisis.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.suicidal_crisis.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.suicidal_crisis.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.suicidal_crisis.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.suicidal_crisis.nodes.node_03b.feedback'
    }
  }
};

// Fall 22: Psychotische Episode
const casePsychoticEpisode: DecisionTreeSimulation = {
  id: 'case_psychotic_episode',
  type: 'decision_tree',
  titleKey: 'cases.psychotic_episode.title',
  descriptionKey: 'cases.psychotic_episode.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.psychotic_episode.nodes.node_01.text',
      choices: [
        { textKey: 'cases.psychotic_episode.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.psychotic_episode.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.psychotic_episode.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.psychotic_episode.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.psychotic_episode.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.psychotic_episode.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.psychotic_episode.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.psychotic_episode.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.psychotic_episode.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.psychotic_episode.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.psychotic_episode.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.psychotic_episode.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.psychotic_episode.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.psychotic_episode.nodes.node_03b.feedback'
    }
  }
};

// Fall 23: Aggressiver Patient
const caseAggressivePatient: DecisionTreeSimulation = {
  id: 'case_aggressive_patient',
  type: 'decision_tree',
  titleKey: 'cases.aggressive_patient.title',
  descriptionKey: 'cases.aggressive_patient.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.aggressive_patient.nodes.node_01.text',
      choices: [
        { textKey: 'cases.aggressive_patient.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.aggressive_patient.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.aggressive_patient.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.aggressive_patient.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.aggressive_patient.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.aggressive_patient.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.aggressive_patient.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.aggressive_patient.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.aggressive_patient.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.aggressive_patient.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.aggressive_patient.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.aggressive_patient.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.aggressive_patient.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.aggressive_patient.nodes.node_03b.feedback'
    }
  }
};

// Fall 24: Chemotherapie-Nebenwirkungen
const caseChemoSideEffects: DecisionTreeSimulation = {
  id: 'case_chemo_side_effects',
  type: 'decision_tree',
  titleKey: 'cases.chemo_side_effects.title',
  descriptionKey: 'cases.chemo_side_effects.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.chemo_side_effects.nodes.node_01.text',
      choices: [
        { textKey: 'cases.chemo_side_effects.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.chemo_side_effects.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.chemo_side_effects.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.chemo_side_effects.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.chemo_side_effects.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.chemo_side_effects.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.chemo_side_effects.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.chemo_side_effects.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.chemo_side_effects.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.chemo_side_effects.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.chemo_side_effects.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.chemo_side_effects.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.chemo_side_effects.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.chemo_side_effects.nodes.node_03b.feedback'
    }
  }
};

// Fall 25: Neutropenie nach Chemotherapie
const caseNeutropenia: DecisionTreeSimulation = {
  id: 'case_neutropenia',
  type: 'decision_tree',
  titleKey: 'cases.neutropenia.title',
  descriptionKey: 'cases.neutropenia.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.neutropenia.nodes.node_01.text',
      choices: [
        { textKey: 'cases.neutropenia.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.neutropenia.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.neutropenia.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.neutropenia.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.neutropenia.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.neutropenia.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.neutropenia.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.neutropenia.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.neutropenia.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.neutropenia.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.neutropenia.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.neutropenia.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.neutropenia.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.neutropenia.nodes.node_03b.feedback'
    }
  }
};

// Fall 26: Tumorschmerzen
const caseTumorPain: DecisionTreeSimulation = {
  id: 'case_tumor_pain',
  type: 'decision_tree',
  titleKey: 'cases.tumor_pain.title',
  descriptionKey: 'cases.tumor_pain.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.tumor_pain.nodes.node_01.text',
      choices: [
        { textKey: 'cases.tumor_pain.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.tumor_pain.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.tumor_pain.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.tumor_pain.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.tumor_pain.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.tumor_pain.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.tumor_pain.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.tumor_pain.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.tumor_pain.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.tumor_pain.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.tumor_pain.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.tumor_pain.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.tumor_pain.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.tumor_pain.nodes.node_03b.feedback'
    }
  }
};

// Fall 27: Palliative Betreuung
const casePalliativeCare: DecisionTreeSimulation = {
  id: 'case_palliative_care',
  type: 'decision_tree',
  titleKey: 'cases.palliative_care.title',
  descriptionKey: 'cases.palliative_care.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.palliative_care.nodes.node_01.text',
      choices: [
        { textKey: 'cases.palliative_care.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.palliative_care.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.palliative_care.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.palliative_care.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.palliative_care.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.palliative_care.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.palliative_care.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.palliative_care.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.palliative_care.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.palliative_care.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.palliative_care.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.palliative_care.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.palliative_care.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.palliative_care.nodes.node_03b.feedback'
    }
  }
};

// Fall 28: Angehörigengespräch bei Terminal-Erkrankung
const caseTerminalDiagnosis: DecisionTreeSimulation = {
  id: 'case_terminal_diagnosis',
  type: 'decision_tree',
  titleKey: 'cases.terminal_diagnosis.title',
  descriptionKey: 'cases.terminal_diagnosis.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.terminal_diagnosis.nodes.node_01.text',
      choices: [
        { textKey: 'cases.terminal_diagnosis.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.terminal_diagnosis.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.terminal_diagnosis.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.terminal_diagnosis.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.terminal_diagnosis.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.terminal_diagnosis.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.terminal_diagnosis.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.terminal_diagnosis.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.terminal_diagnosis.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.terminal_diagnosis.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.terminal_diagnosis.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.terminal_diagnosis.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.terminal_diagnosis.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.terminal_diagnosis.nodes.node_03b.feedback'
    }
  }
};

// Fall 29: Sterbephase und Angehörigenbetreuung
const caseDyingProcess: DecisionTreeSimulation = {
  id: 'case_dying_process',
  type: 'decision_tree',
  titleKey: 'cases.dying_process.title',
  descriptionKey: 'cases.dying_process.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.dying_process.nodes.node_01.text',
      choices: [
        { textKey: 'cases.dying_process.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.dying_process.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.dying_process.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.dying_process.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.dying_process.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.dying_process.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.dying_process.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.dying_process.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.dying_process.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.dying_process.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.dying_process.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.dying_process.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.dying_process.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.dying_process.nodes.node_03b.feedback'
    }
  }
};

// Fall 30: Organspende-Gespräch
const caseOrganDonation: DecisionTreeSimulation = {
  id: 'case_organ_donation',
  type: 'decision_tree',
  titleKey: 'cases.organ_donation.title',
  descriptionKey: 'cases.organ_donation.description',
  startNodeId: 'node_01',
  nodes: {
    'node_01': {
      textKey: 'cases.organ_donation.nodes.node_01.text',
      choices: [
        { textKey: 'cases.organ_donation.nodes.node_01.choices.choice_01', nextNodeId: 'node_02a' },
        { textKey: 'cases.organ_donation.nodes.node_01.choices.choice_02', nextNodeId: 'node_02b' },
        { textKey: 'cases.organ_donation.nodes.node_01.choices.choice_03', nextNodeId: 'node_02c' }
      ]
    },
    'node_02a': {
      textKey: 'cases.organ_donation.nodes.node_02a.text',
      choices: [
        { textKey: 'cases.organ_donation.nodes.node_02a.choices.choice_01', nextNodeId: 'node_03a' },
        { textKey: 'cases.organ_donation.nodes.node_02a.choices.choice_02', nextNodeId: 'node_03b' }
      ]
    },
    'node_02b': {
      textKey: 'cases.organ_donation.nodes.node_02b.text',
      isEndNode: true,
      feedbackKey: 'cases.organ_donation.nodes.node_02b.feedback'
    },
    'node_02c': {
      textKey: 'cases.organ_donation.nodes.node_02c.text',
      isEndNode: true,
      feedbackKey: 'cases.organ_donation.nodes.node_02c.feedback'
    },
    'node_03a': {
      textKey: 'cases.organ_donation.nodes.node_03a.text',
      isEndNode: true,
      feedbackKey: 'cases.organ_donation.nodes.node_03a.feedback'
    },
    'node_03b': {
      textKey: 'cases.organ_donation.nodes.node_03b.text',
      isEndNode: true,
      feedbackKey: 'cases.organ_donation.nodes.node_03b.feedback'
    }
  }
};

// Export der verfügbaren Simulationen
export const availableSimulations: Simulation[] = [
  casePostopMonitoring,
  skillScInjection,
  caseAcuteMyocardialInfarction,
  caseAnaphylaxis,
  caseAcuteDyspnea,
  caseHypoglycemia,
  caseStroke,
  caseSepsis,
  caseWoundHealing,
  caseGIBleed,
  caseHypertensiveCrisis,
  skillBloodPressure,
  skillHandHygiene,
  skillVitalSigns,
  skillBodyCare,
  skillPositioning,
  skillIVMedication,
  skillIMInjection,
  skillInfusionTherapy,
  skillMedicationSafety,
  skillInsulinInjection,
  skillMedicationPreparation,
  skillVenousAccess,
  skillMedicationDocumentation,
  skillEmergencyMedication,
  skillDrugInteractions,
  skillWoundCare,
  skillCPR,
  skillFirstAid,
  skillNursingDocumentation,
  skillCatheterCare,
  skillEmergencyTriage,
  skillOxygenTherapy,
  skillCarePlanning,
  skillPainAssessment,
  skillFallRiskAssessment,
  caseFallDementia,
  caseDelirVsDementia,
  caseFebrileSeizure,
  caseInfantDehydration,
  caseChildAsthma,
  caseMSRelapse,
  caseEpilepticSeizure,
  caseParkinsonSymptoms,
  casePolypharmacy,
  caseMalnutrition,
  caseSuicidalCrisis,
  casePsychoticEpisode,
  caseAggressivePatient,
  caseChemoSideEffects,
  caseNeutropenia,
  caseTumorPain,
  casePalliativeCare,
  caseTerminalDiagnosis,
  caseDyingProcess,
  caseOrganDonation
];

// Hilfsfunktion zum Abrufen einer Simulation anhand der ID
export const getSimulationById = (id: string): Simulation | undefined => {
  return availableSimulations.find(simulation => simulation.id === id);
};

// Hilfsfunktion zum Abrufen aller Simulationen eines bestimmten Typs
export const getSimulationsByType = (type: 'decision_tree' | 'skill_trainer'): Simulation[] => {
  return availableSimulations.filter(simulation => simulation.type === type);
};

// Hilfsfunktion zum Abrufen des nächsten Decision Tree Falls
export const getNextDecisionTreeCase = (currentCaseId: string): DecisionTreeSimulation | undefined => {
  const decisionTreeCases = availableSimulations.filter(sim => sim.type === 'decision_tree') as DecisionTreeSimulation[];
  const currentIndex = decisionTreeCases.findIndex(sim => sim.id === currentCaseId);
  
  if (currentIndex >= 0 && currentIndex < decisionTreeCases.length - 1) {
    return decisionTreeCases[currentIndex + 1];
  }
  
  return undefined; // Kein nächster Fall verfügbar
}; 