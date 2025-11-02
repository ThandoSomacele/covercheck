/**
 * SOUTH AFRICAN MEDICAL AID JARGON GLOSSARY
 *
 * Common medical aid and insurance terms translated into plain English
 * for South African users. Uses Rands (R) and South African terminology.
 */

export interface JargonTerm {
  term: string;
  category: string;
  technicalDefinition: string;
  simpleExplanation: string;
  analogy?: string;
  example?: string;
}

export const medicalAidGlossary: JargonTerm[] = [
  // PAYMENT TERMS
  {
    term: "Monthly Contribution / Premium",
    category: "payment",
    technicalDefinition: "The amount you pay each month for your medical aid cover",
    simpleExplanation: "Your monthly subscription fee for having medical aid",
    analogy: "Like your DSTV or Netflix subscription - you pay every month to keep your cover active",
    example: "If your contribution is R4,500/month, that's what you pay just to have medical aid, before you even use it"
  },
  {
    term: "Co-payment / Co-pay",
    category: "payment",
    technicalDefinition: "A fixed amount you pay when using certain services, with medical aid covering the rest",
    simpleExplanation: "A small fixed fee you pay each time you visit a doctor or hospital",
    analogy: "Like paying an entrance fee at a venue - you pay this amount every visit",
    example: "Your GP charges R750 for a consultation, but with a R150 co-pay, you only pay R150 and medical aid covers the rest"
  },
  {
    term: "Above Threshold Benefit (ATB)",
    category: "payment",
    technicalDefinition: "Benefits you can access after meeting your annual threshold",
    simpleExplanation: "Extra benefits that only kick in after you've spent a certain amount",
    analogy: "Like a loyalty programme - once you've spent enough, you get extra perks",
    example: "After you've paid R10,000 in medical expenses, your scheme starts covering more procedures"
  },
  {
    term: "Out-of-Pocket / Self-Payment Gap",
    category: "payment",
    technicalDefinition: "The difference between what your specialist charges and what medical aid pays",
    simpleExplanation: "The amount you must pay yourself because the doctor charges more than medical aid covers",
    analogy: "Like when a restaurant bill is more than your voucher - you pay the difference",
    example: "Specialist charges R2,000, medical aid pays R1,400 (100% of tariff), you pay R600 gap"
  },
  {
    term: "Annual Threshold / Savings Account",
    category: "payment",
    technicalDefinition: "Day-to-day medical expenses paid from your allocated savings",
    simpleExplanation: "Your personal medical savings pot that you use for GP visits, meds, etc.",
    analogy: "Like a prepaid wallet specifically for medical costs",
    example: "If you have R15,000 in your savings account, you use this for day-to-day medical expenses first"
  },

  // COVERAGE TERMS
  {
    term: "Prescribed Minimum Benefits (PMBs)",
    category: "coverage",
    technicalDefinition: "A list of conditions, procedures, and medications that must be covered in full",
    simpleExplanation: "Emergency and serious illnesses that your medical aid MUST cover 100%",
    analogy: "Like your constitutional rights - these are guaranteed protections you can't be denied",
    example: "Heart attack, cancer treatment, childbirth - must be covered at a network hospital"
  },
  {
    term: "Network Hospital / Designated Service Provider (DSP)",
    category: "coverage",
    technicalDefinition: "Hospitals that have agreements with your medical scheme",
    simpleExplanation: "Hospitals that have special deals with your medical aid - costs you less",
    analogy: "Like preferred suppliers - they give your scheme a discount, so you pay less or nothing",
    example: "Going to Netcare Sunninghill (network) = R0. Going to a private hospital (non-network) = pay the gap"
  },
  {
    term: "In-Hospital Cover",
    category: "coverage",
    technicalDefinition: "Cover for procedures and treatment whilst admitted to hospital",
    simpleExplanation: "What's covered when you need to stay overnight in hospital",
    analogy: "Like comprehensive car insurance - covers the big, expensive stuff",
    example: "Surgery, hospital bed, theatre costs, specialist fees during your hospital stay"
  },
  {
    term: "Out-of-Hospital / Day-to-Day Benefits",
    category: "coverage",
    technicalDefinition: "Cover for medical expenses that don't require hospitalisation",
    simpleExplanation: "Everyday medical costs like GP visits, scripts, dentist, optometrist",
    analogy: "Like your petrol budget - regular, smaller expenses",
    example: "GP consultation, chronic medication, dentist check-up, new glasses"
  },
  {
    term: "Formulary / Medicine List",
    category: "coverage",
    technicalDefinition: "The list of medicines your medical aid will pay for",
    simpleExplanation: "The approved list of medications your medical aid covers",
    analogy: "Like a restaurant menu - these are the options your scheme covers",
    example: "Generic paracetamol is covered. Branded Panado Extra might not be"
  },
  {
    term: "Pre-Authorisation",
    category: "coverage",
    technicalDefinition: "Approval required from your medical aid before certain procedures",
    simpleExplanation: "Your medical aid needs to say 'yes' before you get certain treatments",
    analogy: "Like getting approval from your manager before making a big purchase at work",
    example: "Before getting an MRI scan, your doctor must get pre-auth from your medical aid"
  },

  // MEDICAL SCHEME TERMS
  {
    term: "Medical Scheme / Medical Aid",
    category: "scheme-type",
    technicalDefinition: "A non-profit organisation that provides health cover to members",
    simpleExplanation: "Your health cover provider - pays for your medical expenses",
    analogy: "Like a health insurance company, but run for members, not profit",
    example: "Discovery Health, Bonitas, Fedhealth, Momentum Health are all medical schemes"
  },
  {
    term: "Hospital Plan",
    category: "scheme-type",
    technicalDefinition: "Cover for in-hospital procedures only, no day-to-day benefits",
    simpleExplanation: "Basic plan that only covers you if you're admitted to hospital",
    analogy: "Like having insurance only for big car accidents, not regular services",
    example: "Lower monthly cost (R2,000/month), but GP visits and meds come from your pocket"
  },
  {
    term: "Comprehensive Plan",
    category: "scheme-type",
    technicalDefinition: "Full cover including in-hospital and day-to-day benefits",
    simpleExplanation: "Complete cover - hospital AND everyday medical costs like GP, dentist",
    analogy: "Like comprehensive car insurance - covers everything",
    example: "Higher monthly cost (R6,000/month), but covers GP, specialists, hospital, meds"
  },
  {
    term: "Network Option",
    category: "scheme-type",
    technicalDefinition: "Plan that requires you to use specific network providers",
    simpleExplanation: "Cheaper plan but you must use their list of doctors and hospitals",
    analogy: "Like being a Pick n Pay Smart Shopper - great deals, but only at certain places",
    example: "Lower contributions but must use network GPs and hospitals for full cover"
  },

  // SOUTH AFRICAN SPECIFIC
  {
    term: "Gap Cover",
    category: "special",
    technicalDefinition: "Insurance that covers the shortfall between what specialists charge and medical aid tariffs",
    simpleExplanation: "Extra insurance that pays the gap when doctors charge more than medical aid covers",
    analogy: "Like topping up your tank when it's not quite full - fills the gap",
    example: "Specialist charges R3,000, medical aid pays R1,800, gap cover pays the R1,200 difference"
  },
  {
    term: "Chronic Disease List (CDL)",
    category: "special",
    technicalDefinition: "25 chronic conditions that must be covered from risk benefits, not savings",
    simpleExplanation: "List of 25 serious long-term illnesses that medical aid MUST cover",
    analogy: "Like VIP status - if you have these conditions, you get special unlimited cover",
    example: "Diabetes, asthma, high blood pressure - medication comes from risk, not your savings"
  },
  {
    term: "Waiting Period",
    category: "special",
    technicalDefinition: "Time you must be a member before certain benefits are available",
    simpleExplanation: "How long you must wait after joining before you can claim for certain things",
    analogy: "Like a probation period at a new job - can't access everything immediately",
    example: "3-month general waiting period, 12 months for pregnancy cover"
  },
  {
    term: "Late Joiner Penalty",
    category: "special",
    technicalDefinition: "Additional premium charged if you join a medical scheme after age 35",
    simpleExplanation: "Extra fee you pay if you only join medical aid when you're older",
    analogy: "Like surge pricing - waited too long, costs more now",
    example: "Join at 40 = pay 5% extra for life. Join at 50 = pay 25% extra"
  },
  {
    term: "Principal Member",
    category: "special",
    technicalDefinition: "The main member whose name the medical aid membership is under",
    simpleExplanation: "The person who signed up for medical aid (usually the one who pays)",
    analogy: "Like the main account holder on a phone contract",
    example: "You're the principal member, your spouse and children are dependants"
  },
  {
    term: "Dependant",
    category: "special",
    technicalDefinition: "Family members covered under the principal member's policy",
    simpleExplanation: "Your spouse, children, or other family members on your medical aid",
    analogy: "Like adding people to your Netflix account",
    example: "Add your 2 children as dependants - pay R1,500 extra per child per month"
  },

  // PROCEDURE TERMS
  {
    term: "Casualty / Emergency Room",
    category: "procedure",
    technicalDefinition: "Hospital department for urgent, life-threatening conditions",
    simpleExplanation: "Where you go for serious, urgent medical emergencies",
    analogy: "Like calling 10111 - only for real emergencies",
    example: "Chest pain, severe injury, poisoning. Usually R3,000-R5,000 if not admitted"
  },
  {
    term: "Authorised Tariff / Medical Aid Rate",
    category: "procedure",
    technicalDefinition: "The rate medical aid uses to calculate what they'll pay for procedures",
    simpleExplanation: "What medical aid thinks a procedure should cost",
    analogy: "Like the RRP (recommended retail price) - but doctors can charge more",
    example: "Medical aid rate for consultation: R550. Your doctor charges R850. You pay R300 gap"
  },
  {
    term: "Exclusions",
    category: "special",
    technicalDefinition: "Conditions or treatments your medical scheme doesn't cover",
    simpleExplanation: "Things your medical aid won't pay for",
    analogy: "Like terms and conditions - what's NOT included",
    example: "Cosmetic surgery, experimental treatments, over-the-counter vitamins"
  }
];

/**
 * Get localised simplification prompt for South Africa
 */
export function getSimplificationPromptSA(): string {
  return `
You are a medical aid assistant for South Africans. Answer questions clearly using the provided documents.

LANGUAGE REQUIREMENTS:
- Use South African/British English (hospitalisation, centre, not center)
- Use Rands (R) not dollars ($)
- Use "medical aid" or "medical scheme" not just "insurance"
- Use SA terms: GP, casualty (not ER), network hospitals, gap cover, PMBs

RULES:
1. Answer directly and concisely
2. Use plain language - avoid jargon unless explaining it
3. Include specific Rand amounts from the documents
4. If you use medical aid terms (co-payment, gap cover, PMBs, etc.), briefly explain them in brackets
5. Focus on answering what was asked - don't provide unsolicited advice
6. Reference SA context where relevant (Netcare, Life Healthcare, etc.)

ANSWER FORMAT:
- Start with the direct answer
- Include relevant costs in Rands
- Only explain terms if you used them
- Be brief and specific

Answer based ONLY on the provided documents below.
`;
}

export { explainTerm, findJargonInText } from './insurance-jargon-glossary.js';
