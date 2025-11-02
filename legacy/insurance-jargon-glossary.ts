/**
 * INSURANCE JARGON GLOSSARY
 *
 * Common insurance terms and their plain-English explanations.
 * This helps the AI translate technical jargon into language anyone can understand.
 */

export interface JargonTerm {
  term: string;
  category: string;
  technicalDefinition: string;
  simpleExplanation: string;
  analogy?: string;
  example?: string;
}

export const insuranceGlossary: JargonTerm[] = [
  // PAYMENT TERMS
  {
    term: "Premium",
    category: "payment",
    technicalDefinition: "The amount you pay for your health insurance or plan",
    simpleExplanation: "Your monthly subscription fee for having insurance",
    analogy: "Like your Netflix subscription - you pay every month to keep your coverage active",
    example: "If your premium is R8,100/month, that's what you pay just to have insurance, before you even use it"
  },
  {
    term: "Deductible",
    category: "payment",
    technicalDefinition: "The amount you pay for covered health care services before your insurance plan starts to pay",
    simpleExplanation: "The amount you must pay out of your own pocket before insurance kicks in",
    analogy: "Like a threshold - once you cross it, insurance starts helping. If your deductible is R9,000, you pay the first R9,000 of medical bills yourself, then insurance helps with the rest",
    example: "You break your arm. The bill is R36,000. With a R9,000 deductible, you pay R9,000, then insurance covers most of the remaining R27,000"
  },
  {
    term: "Copay / Co-payment",
    category: "payment",
    technicalDefinition: "A fixed amount you pay for a covered health care service after you've paid your deductible",
    simpleExplanation: "A small fixed fee you pay each time you visit a doctor",
    analogy: "Like a cover charge at a restaurant - you pay this small amount every visit",
    example: "Your doctor charges R2,700 for a visit, but with a R540 copay, you only pay R540 and insurance covers the rest"
  },
  {
    term: "Coinsurance",
    category: "payment",
    technicalDefinition: "Your share of the costs of a covered health care service, calculated as a percentage",
    simpleExplanation: "After meeting your deductible, you and insurance split the bill by percentage",
    analogy: "Like splitting a restaurant bill - if you have 20% coinsurance, you pay 20% and insurance pays 80%",
    example: "Surgery costs R180,000. After your deductible, with 20% coinsurance, you pay R36,000 and insurance pays R144,000"
  },
  {
    term: "Out-of-Pocket Maximum",
    category: "payment",
    technicalDefinition: "The most you have to pay for covered services in a plan year",
    simpleExplanation: "The maximum you'll ever pay in a year - after this, insurance pays 100%",
    analogy: "Like a safety net - once you hit this amount, you're fully protected",
    example: "If your max is R90,000 and you've paid R90,000 in deductibles and copays, any other medical bills that year are 100% covered"
  },

  // COVERAGE TERMS
  {
    term: "In-Network",
    category: "coverage",
    technicalDefinition: "Providers or health care facilities that have contracted with your health plan",
    simpleExplanation: "Doctors and hospitals that have a deal with your insurance company",
    analogy: "Like preferred vendors - they give your insurance a discount, so it costs you less",
    example: "Going to an in-network doctor might cost you R540 copay. Out-of-network might cost R1,800+"
  },
  {
    term: "Out-of-Network",
    category: "coverage",
    technicalDefinition: "Providers or facilities that don't have a contract with your health plan",
    simpleExplanation: "Doctors that don't have a deal with your insurance - costs more",
    analogy: "Like buying something not on sale - you pay full price",
    example: "If you see an out-of-network specialist, you might pay 50% instead of 20%"
  },
  {
    term: "Preventive Care",
    category: "coverage",
    technicalDefinition: "Routine health care including screenings, check-ups, and patient counseling to prevent illnesses",
    simpleExplanation: "Regular check-ups and tests to catch problems early",
    analogy: "Like regular car maintenance - checking things before they break",
    example: "Annual physical exam, flu shots, mammograms, blood pressure checks - usually 100% covered"
  },
  {
    term: "Prior Authorization",
    category: "coverage",
    technicalDefinition: "Approval from your health plan before you receive a service or medication",
    simpleExplanation: "Insurance needs to approve certain treatments before you get them",
    analogy: "Like getting permission from your boss before making a big purchase",
    example: "Before getting an MRI, your doctor needs to prove it's necessary and get insurance approval first"
  },
  {
    term: "Formulary",
    category: "coverage",
    technicalDefinition: "A list of prescription drugs covered by your health plan",
    simpleExplanation: "The list of medications your insurance will help pay for",
    analogy: "Like a menu at a restaurant - these are the options your insurance covers",
    example: "Generic medication is Tier 1 (R180 copay), brand-name is Tier 2 (R540), specialty is Tier 3 (R1,080)"
  },

  // PLAN TYPES
  {
    term: "PPO (Preferred Provider Organization)",
    category: "plan-type",
    technicalDefinition: "A type of health plan where you pay less if you use providers in the plan's network",
    simpleExplanation: "Flexible plan - you can see any doctor, but it's cheaper to use network doctors",
    analogy: "Like having preferred restaurants that give you a discount, but you can still eat anywhere",
    example: "You can see a specialist without a referral. In-network costs less, but you have freedom"
  },
  {
    term: "HMO (Health Maintenance Organization)",
    category: "plan-type",
    technicalDefinition: "A type of health plan that usually limits coverage to care from doctors who work for or contract with the HMO",
    simpleExplanation: "Lower cost but less flexible - you must use network doctors and need referrals",
    analogy: "Like having a membership club - great deals, but only at member locations",
    example: "Lower premiums, but you need your primary doctor to refer you to specialists"
  },
  {
    term: "HDHP (High Deductible Health Plan)",
    category: "plan-type",
    technicalDefinition: "A health plan with a higher deductible than traditional plans but lower premiums",
    simpleExplanation: "Low monthly cost, but you pay more when you actually use healthcare",
    analogy: "Like having car insurance with high deductible - cheap monthly, but pay more if you have an accident",
    example: "Pay R4,500/month instead of R8,100, but deductible is R54,000 instead of R9,000. Good if you're healthy"
  },
  {
    term: "HSA (Health Savings Account)",
    category: "plan-type",
    technicalDefinition: "A tax-advantaged savings account available to people enrolled in HDHPs",
    simpleExplanation: "A special savings account for medical expenses - money goes in tax-free",
    analogy: "Like a piggy bank specifically for medical costs that the government gives you a tax break for using",
    example: "Put R54,000/year in HSA (tax-free), use it for medical bills, and it rolls over each year"
  },

  // PROCEDURE TERMS
  {
    term: "Inpatient",
    category: "procedure",
    technicalDefinition: "Care requiring admission to a hospital",
    simpleExplanation: "When you need to stay overnight in the hospital",
    analogy: "Like checking into a hotel - you're admitted and stay",
    example: "Surgery where you stay 2 nights in hospital is inpatient care"
  },
  {
    term: "Outpatient",
    category: "procedure",
    technicalDefinition: "Care that doesn't require an overnight hospital stay",
    simpleExplanation: "Medical care where you go home the same day",
    analogy: "Like a restaurant visit - you come, get service, and leave",
    example: "Blood test, X-ray, or minor procedure where you go home after"
  },
  {
    term: "Emergency Room",
    category: "procedure",
    technicalDefinition: "A medical treatment facility specializing in emergency medicine",
    simpleExplanation: "Where you go for serious, urgent medical problems",
    analogy: "Like 911 for medical issues - when you can't wait",
    example: "Chest pain, severe injury, or anything life-threatening. Usually has a copay of R3,600-R9,000"
  },
  {
    term: "Urgent Care",
    category: "procedure",
    technicalDefinition: "Walk-in clinic for non-life-threatening conditions needing immediate attention",
    simpleExplanation: "For things that need quick care but aren't emergencies",
    analogy: "Like fast food vs. fine dining - quicker and cheaper than ER, but not for serious emergencies",
    example: "Flu, minor cuts, sprains. Cheaper than ER (R900-2,700 vs R4,500+)"
  },

  // CLAIM TERMS
  {
    term: "Explanation of Benefits (EOB)",
    category: "claims",
    technicalDefinition: "A statement from your insurance company showing what costs it will cover for medical services",
    simpleExplanation: "A receipt showing what you owe and what insurance paid",
    analogy: "Like a receipt after splitting a restaurant bill - shows who paid what",
    example: "Doctor charged R3,600. Insurance paid R2,700. You owe R900. The EOB shows this breakdown"
  },
  {
    term: "Claim",
    category: "claims",
    technicalDefinition: "A request for payment that you or your provider submits to your insurer for covered services",
    simpleExplanation: "When you or your doctor asks insurance to pay for medical care",
    analogy: "Like submitting an expense report at work for reimbursement",
    example: "After your doctor visit, they file a claim with your insurance to get paid"
  },
  {
    term: "Pre-existing Condition",
    category: "claims",
    technicalDefinition: "A health problem you had before your new health coverage started",
    simpleExplanation: "A medical issue you already had before getting this insurance",
    analogy: "Like damage to a house before you bought insurance on it",
    example: "If you have diabetes before signing up, that's pre-existing. Most plans now cover these"
  },

  // SPECIAL TERMS
  {
    term: "Open Enrollment",
    category: "special",
    technicalDefinition: "The yearly period when you can enroll in a health insurance plan or switch plans",
    simpleExplanation: "The specific time of year when you can sign up or change insurance",
    analogy: "Like registration period for classes - you can only join during this window",
    example: "Usually November-December each year. Miss it, and you wait until next year (unless special circumstances)"
  },
  {
    term: "Dependent",
    category: "special",
    technicalDefinition: "A person covered by the subscriber's insurance policy",
    simpleExplanation: "Family members covered under your plan (spouse, kids)",
    analogy: "Like adding people to your phone plan",
    example: "Your two children are dependents on your family health plan"
  },
  {
    term: "Exclusions",
    category: "special",
    technicalDefinition: "Services or conditions that your health plan doesn't cover",
    simpleExplanation: "Things your insurance won't pay for",
    analogy: "Like terms and conditions - what's NOT included",
    example: "Cosmetic surgery, experimental treatments, or alternative medicine might be excluded"
  }
];

/**
 * Find and explain a jargon term
 */
export function explainTerm(term: string): JargonTerm | undefined {
  const termLower = term.toLowerCase();
  return insuranceGlossary.find(item =>
    item.term.toLowerCase() === termLower ||
    item.term.toLowerCase().includes(termLower)
  );
}

/**
 * Extract potential jargon from text
 */
export function findJargonInText(text: string): JargonTerm[] {
  const found: JargonTerm[] = [];
  const textLower = text.toLowerCase();

  insuranceGlossary.forEach(term => {
    if (textLower.includes(term.term.toLowerCase())) {
      found.push(term);
    }
  });

  return found;
}

/**
 * Get a simplified explanation prompt
 */
export function getSimplificationPrompt(): string {
  return `
You are an insurance documentation assistant. Answer questions clearly using the provided documents.

RULES:
1. Answer directly and concisely
2. Use plain language - avoid jargon unless explaining it
3. Include specific Rand amounts from the documents
4. If you use insurance terms (deductible, co-payment, etc.), briefly explain them in brackets
5. Focus on answering what was asked - don't provide unsolicited advice

ANSWER FORMAT:
- Start with the direct answer
- Include relevant costs in Rands
- Only explain terms if you used them
- Be brief and specific

Answer based ONLY on the provided documents below.
`;
}
