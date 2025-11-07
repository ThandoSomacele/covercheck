# Verified Working URLs for Medical Aid Scraping

**Last Updated:** 2025-11-07
**Status:** Research Complete

## Discovery Health Medical Scheme

### Base URL
`https://www.discovery.co.za`

### Plan Pages (7 main plans)
1. **Executive Plan**: `/medical-aid/executive-plan` ✅ VERIFIED
2. **Comprehensive Series**: `/medical-aid/comprehensive-series`
3. **Priority Series**: `/medical-aid/priority-series`
4. **Saver Series**: `/medical-aid/saver-series`
5. **Smart Saver Plan**: `/medical-aid/smart-saver-plan`
6. **Smart Series**: `/medical-aid/smart-series`
7. **Core Series**: `/medical-aid/core-series`
8. **KeyCare Series**: `/medical-aid/keycare-series` (bonus - network plan)

### Benefits & Coverage Pages
1. **Benefits Overview**: `/medical-aid/benefits-and-cover`
2. **Chronic Illness Benefit**: `/medical-aid/chronic-illness-benefit` ✅ VERIFIED (working in previous scrape)
3. **Product Benefit Enhancements**: `/medical-aid/product-benefit-enhancements` (2025 benefits)
4. **Extra Savings and Services**: `/medical-aid/extra-savings-and-services`

### Support & Information Pages
1. **How to Claim**: `/medical-aid/how-to-claim`
2. **Ask for Help**: `/medical-aid/ask-discovery-health-for-help`
3. **Find Documents**: `/medical-aid/find-documents`
4. **Compare Plans**: `/medical-aid/compare-medical-aid-plans`
5. **About Discovery Health**: `/medical-aid/about-discovery-health-medical-scheme`

**Total Discovery URLs: 17**

---

## Bonitas Medical Fund

### Base URL
`https://www.bonitas.co.za`

### Plan Pages
Based on 2025 plan brochures found:

1. **BonCap** (Income-based plan): `/plans/` (main page has plan selector)
2. **BonFit / BonFit Select**: Available via plans page
3. **BonSave / BonSave Select**: Savings plan options
4. **BonEssential / BonEssential Select**: Hospital-only plans
5. **Primary / Primary Select**: Traditional with hospital list
6. **Standard / Standard Select**: Traditional all hospitals

### Benefits & Information Pages
1. **Plans Overview**: `/plans/` ✅ FOUND
2. **Rules and Amendments**: `/rules-and-amendments`

### Note on Bonitas
- Bonitas uses a **dynamic plan selector interface** on `/plans/`
- Individual plan pages may be dynamically loaded
- **2025 PDF Brochures** available:
  - `https://www.bonitas.co.za/wp-content/uploads/2025/06/Standard-Standard-Select-2025.pdf`
  - `https://www.bonitas.co.za/wp-content/uploads/2025/06/BonSave-BonFit-Select-2025.pdf`
  - `https://www.bonitas.co.za/wp-content/uploads/2025/06/BonEssential-BonEssential-select-2025.pdf`
  - `https://www.bonitas.co.za/wp-content/uploads/2025/05/Primary-Primary-select-2025.pdf`
  - `https://www.bonitas.co.za/wp-content/uploads/2025/06/BonCap-2025.pdf`

**Strategy for Bonitas:** Scrape the main `/plans/` page which contains all plan information, OR scrape PDF brochures and extract text.

---

## Momentum Health (Momentum Medical Scheme)

### Base URL
`https://www.momentum.co.za`

### Plan Pages (6 main options)
1. **Custom Option**: `/momentum/personal/medical-aid/custom-option` or `/momentum/personal/products/medical-aid/custom-option` ✅ VERIFIED
2. **Incentive Option**: `/momentum/personal/medical-aid/incentive-option` ✅ VERIFIED
3. **Summit Option**: `/momentum/personal/medical-aid/summit-option` ✅ VERIFIED
4. **Extender Option**: `/momentum/personal/medical-aid/extender-option` ✅ VERIFIED
5. **Ingwe Option**: `/momentum/personal/medical-aid/ingwe-option` (needs verification)
6. **Provider Choice**: `/momentum/personal/medical-aid/provider-choice` (feature, not plan)

### Benefits Pages
1. **Day-to-Day Benefit**: `/momentum/personal/products/medical-aid/day-to-day-benefit` ✅ VERIFIED
2. **In-Hospital Benefit**: `/momentum/personal/medical-aid/in-hospital-benefit` ✅ VERIFIED
3. **Chronic Benefit**: `/momentum/personal/medical-aid/chronic-benefit/chronic-conditions-covered` ✅ VERIFIED

### Support & Information Pages
1. **Medical Aid Overview**: `/momentum/personal/medical-aid` ✅ VERIFIED
2. **Compare Plans**: `/momentum/personal/medical-aid/compare-medical-aid-plans`
3. **HealthReturns** (Multiply): Part of plan pages - look for "Multiply Inspire" mentions

**Total Momentum URLs: 11**

---

## URL Pattern Observations

### Discovery Health
- Clean, modern URLs
- Consistent `/medical-aid/{topic}` structure
- All pages tested load successfully

### Bonitas Medical Fund
- Uses WordPress CMS (`/wp-content/uploads/`)
- Dynamic plan selector interface
- PDFs for detailed plan information
- Less structured than other providers

### Momentum Health
- Nested structure: `/momentum/personal/medical-aid/{plan}`
- Some URLs have alternative paths (`/products/medical-aid/` vs `/medical-aid/`)
- Very detailed benefit pages

---

## Scraping Strategy Recommendations

### Discovery Health
✅ **Ready to scrape** - All URLs work, good content structure

### Bonitas Medical Fund
⚠️ **Needs special handling**:
- Option 1: Scrape main `/plans/` page with longer JavaScript wait time
- Option 2: Extract text from PDF brochures
- Option 3: Use Playwright to interact with plan selector

### Momentum Health
✅ **Ready to scrape** - URLs verified through search, good structure

---

## Next Steps

1. Update scrapers with these verified URLs
2. For Bonitas, implement PDF scraping OR longer page wait times
3. Test each provider individually
4. Validate content quality meets 20+ document threshold
