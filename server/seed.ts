import { db } from "./db";
import { products, coas, legalDocuments, educationArticles } from "@shared/schema";

const sampleProducts = [
  {
    name: "BPC-157",
    description: "BPC-157 is a synthetic peptide consisting of 15 amino acids. It is a partial sequence of body protection compound (BPC) found in human gastric juice. This research compound has been extensively studied for its potential regenerative properties in laboratory settings.",
    shortDescription: "15 amino acid synthetic peptide for research applications",
    price: "64.99",
    originalPrice: null,
    category: "Peptides",
    inStock: true,
    featured: true,
    benefits: [
      "High purity research grade compound",
      "Third-party tested for quality assurance",
      "Includes Certificate of Analysis",
      "Lyophilized powder form for stability"
    ],
    usage: "For laboratory research use only. Store at -20°C. Reconstitute with bacteriostatic water before use.",
    imageUrl: "/attached_assets/image_1764731697645.png",
  },
  {
    name: "TB-500",
    description: "TB-500 is a synthetic version of the naturally occurring peptide Thymosin Beta-4. This research compound consists of 43 amino acids and has been the subject of numerous scientific studies examining cellular processes and tissue regeneration mechanisms.",
    shortDescription: "43 amino acid research peptide compound",
    price: "63.99",
    originalPrice: null,
    category: "Peptides",
    inStock: true,
    featured: true,
    benefits: [
      "Research grade purity >99%",
      "Comprehensive lab testing documentation",
      "COA included with every order",
      "Stable lyophilized formulation"
    ],
    usage: "For laboratory research purposes only. Store frozen at -20°C. Handle according to standard peptide protocols.",
    imageUrl: "/attached_assets/image_1764720544229.png",
  },
  {
    name: "GHK-Cu",
    description: "GHK-Cu is a copper peptide complex consisting of the tripeptide glycyl-L-histidyl-L-lysine bound to copper. This research compound has been extensively studied for its role in various biological processes and cellular signaling pathways.",
    shortDescription: "Copper tripeptide complex for research",
    price: "51.99",
    originalPrice: null,
    category: "Peptides",
    inStock: true,
    featured: true,
    benefits: [
      "High-purity copper peptide complex",
      "Verified by independent laboratory testing",
      "Certificate of Analysis provided",
      "Research-ready formulation"
    ],
    usage: "For research applications only. Store in cool, dry conditions. Follow standard laboratory handling procedures.",
    imageUrl: "/attached_assets/image_1764722986424.png",
  },
  {
    name: "Epithalon",
    description: "Epithalon is a synthetic tetrapeptide (Ala-Glu-Asp-Gly) that has been studied in research settings for its potential effects on telomerase activity. This research compound is provided in high-purity lyophilized form.",
    shortDescription: "Tetrapeptide for telomerase research",
    price: "49.99",
    originalPrice: null,
    category: "Peptides",
    inStock: true,
    featured: false,
    benefits: [
      "Synthetic tetrapeptide compound",
      ">98% purity verified",
      "Third-party lab tested",
      "Complete documentation included"
    ],
    usage: "For laboratory research only. Store at recommended temperature. Handle with appropriate precautions.",
    imageUrl: "/attached_assets/image_1764723493346.png",
  },
  {
    name: "Ipamorelin",
    description: "Ipamorelin is a synthetic pentapeptide that has been studied for its selective growth hormone releasing properties in research settings. This compound consists of 5 amino acids and is provided in research-grade purity.",
    shortDescription: "Pentapeptide growth hormone research compound",
    price: "59.99",
    originalPrice: null,
    category: "Peptides",
    inStock: true,
    featured: false,
    benefits: [
      "Selective pentapeptide compound",
      "Research-grade purity standards",
      "Full COA documentation",
      "Lyophilized for stability"
    ],
    usage: "For research purposes only. Maintain proper storage conditions. Follow standard peptide handling protocols.",
    imageUrl: "/attached_assets/image_1764720456218.png",
  },
  {
    name: "Semax",
    description: "Semax is a synthetic peptide derived from ACTH (adrenocorticotropic hormone). This heptapeptide has been the subject of research examining cognitive and neurological processes in laboratory settings.",
    shortDescription: "ACTH-derived heptapeptide for neuroscience research",
    price: "69.99",
    originalPrice: null,
    category: "Peptides",
    inStock: false,
    featured: false,
    benefits: [
      "Synthetic heptapeptide compound",
      "High analytical purity",
      "Comprehensive testing documentation",
      "Suitable for neuroscience research"
    ],
    usage: "For laboratory research applications. Store frozen. Handle according to established protocols.",
    imageUrl: "/attached_assets/image_1764717908257.png",
  },
  {
    name: "Bacteriostatic Water",
    description: "Bacteriostatic Water (BAC Water) is sterile water containing 0.9% benzyl alcohol as a preservative. This research-grade solution is commonly used in laboratory settings for reconstituting lyophilized peptide compounds. The benzyl alcohol preservative allows for multiple uses from a single vial while maintaining sterility.",
    shortDescription: "Sterile water with 0.9% benzyl alcohol for peptide reconstitution",
    price: "9.99",
    originalPrice: null,
    category: "Supplies",
    inStock: true,
    featured: false,
    benefits: [
      "USP-grade sterile water",
      "0.9% benzyl alcohol preservative",
      "30ML multi-use vial",
      "Ideal for peptide reconstitution",
      "Extended shelf life after opening"
    ],
    usage: "For laboratory research use only. Store at room temperature. Use aseptic technique when withdrawing solution.",
    imageUrl: null,
  },
];

async function seed() {
  console.log("Starting database seed...");

  const existingProducts = await db.select().from(products);
  if (existingProducts.length > 0) {
    console.log("Database already has products, skipping product seed.");
  } else {
  console.log("Inserting products...");
  const insertedProducts = await db.insert(products).values(sampleProducts).returning();
  console.log(`Inserted ${insertedProducts.length} products`);

  const sampleCoas = [
    {
      batchNumber: "RVR-2024-001",
      productId: insertedProducts[0].id,
      productName: "BPC-157",
      testDate: "November 15, 2024",
      expirationDate: "November 15, 2026",
      purity: "99.2%",
      labName: "Analytical Labs International",
      verified: true,
      results: [
        "HPLC Purity|≥98%|99.2%|pass",
        "Mass Spectrometry|1419.53 Da|1419.51 Da|pass",
        "Peptide Content|≥95%|97.8%|pass",
        "Endotoxin|<0.5 EU/mg|<0.1 EU/mg|pass",
        "Sterility|Negative|Negative|pass"
      ],
    },
    {
      batchNumber: "RVR-2024-002",
      productId: insertedProducts[1].id,
      productName: "TB-500",
      testDate: "November 10, 2024",
      expirationDate: "November 10, 2026",
      purity: "99.5%",
      labName: "Analytical Labs International",
      verified: true,
      results: [
        "HPLC Purity|≥98%|99.5%|pass",
        "Mass Spectrometry|4963.44 Da|4963.42 Da|pass",
        "Peptide Content|≥95%|98.2%|pass",
        "Endotoxin|<0.5 EU/mg|<0.1 EU/mg|pass",
        "Sterility|Negative|Negative|pass"
      ],
    },
    {
      batchNumber: "RVR-2024-003",
      productId: insertedProducts[2].id,
      productName: "GHK-Cu",
      testDate: "November 5, 2024",
      expirationDate: "November 5, 2026",
      purity: "98.7%",
      labName: "Analytical Labs International",
      verified: true,
      results: [
        "HPLC Purity|≥98%|98.7%|pass",
        "Copper Content|9-11%|10.2%|pass",
        "Peptide Content|≥95%|96.5%|pass",
        "Heavy Metals|<10 ppm|<5 ppm|pass",
        "Sterility|Negative|Negative|pass"
      ],
    },
  ];

  console.log("Inserting COAs...");
  const insertedCoas = await db.insert(coas).values(sampleCoas).returning();
  console.log(`Inserted ${insertedCoas.length} COAs`);
  }

  // Seed Legal Documents
  const existingLegalDocs = await db.select().from(legalDocuments);
  if (existingLegalDocs.length === 0) {
    console.log("Inserting legal documents...");
    
    const sampleLegalDocuments = [
      // POLICIES CATEGORY
      {
        slug: "quality-assurance-policy",
        title: "Quality Assurance Policy",
        category: "policies",
        summary: "Our comprehensive quality assurance program ensures the highest standards for all research compounds.",
        effectiveDate: new Date("2023-12-31"),
        isPublished: true,
        sortOrder: 1,
        content: `# Quality Assurance Policy

**Last Updated:** November 14, 2024  
**Effective Date:** December 31, 2023

Our comprehensive quality assurance program ensures the highest standards for all research compounds.

---

## Our Commitment to Quality

At Revive Research, we maintain the highest standards of quality for all our research compounds. Our quality assurance program includes rigorous testing protocols, documented procedures, and continuous improvement processes.

### Third-Party Testing

Every batch undergoes independent laboratory analysis including:

- **HPLC Purity Testing** - High-performance liquid chromatography to verify compound purity levels exceeding 98%
- **Mass Spectrometry Identification** - Confirms molecular identity and structural integrity
- **Endotoxin Screening** - LAL testing to ensure products meet research-grade endotoxin limits
- **Sterility Testing** - Microbiological analysis to confirm absence of contamination
- **Heavy Metals Analysis** - ICP-MS testing for arsenic, lead, mercury, and cadmium

Results are documented in our Certificate of Analysis (COA) system, available for every batch.

### Traceability

Each product is assigned a unique batch number enabling complete traceability from synthesis through delivery. Our traceability system includes:

- Raw material sourcing documentation
- Manufacturing process records
- Quality control test results
- Storage condition monitoring
- Distribution chain records

### Manufacturing Standards

Our synthesis partners operate under strict quality management systems:

- **cGMP-like Conditions** - Manufacturing follows current Good Manufacturing Practice principles
- **ISO 17025 Accredited Labs** - All testing performed by accredited analytical laboratories
- **Documented SOPs** - Standard Operating Procedures govern all processes
- **Environmental Controls** - Temperature, humidity, and particulate monitoring
- **Personnel Training** - All staff trained and competency-verified

### Storage & Handling

Products are stored and handled according to established protocols:

- Temperature-controlled storage facilities
- Light-protected packaging
- Humidity-controlled environments
- First-in, first-out inventory management
- Cold-chain shipping when required

### Continuous Improvement

We regularly review and improve our quality systems through:

- Internal quality audits
- Customer feedback analysis
- Corrective and preventive action programs
- Regular supplier evaluations
- Technology upgrades and modernization

---

## Quality Guarantee

If you receive a product that does not meet our quality specifications, contact us within 48 hours with your batch number and a description of the issue. Our quality team will investigate and resolve any legitimate concerns.

For questions about our quality program, contact: **quality@reviveresearch.co**`
      },
      {
        slug: "research-use-disclaimer",
        title: "Research Use Disclaimer",
        category: "policies",
        summary: "Important disclaimer regarding the research-only nature of our products and buyer responsibilities.",
        effectiveDate: new Date("2023-12-31"),
        isPublished: true,
        sortOrder: 2,
        content: `# Research Use Disclaimer

**Last Updated:** October 31, 2024  
**Effective Date:** December 31, 2023

Important disclaimer regarding the research-only nature of our products and buyer responsibilities.

---

## Research Use Only

All products sold by Revive Research are intended solely for laboratory research purposes. These products are **NOT** intended for:

- Human consumption
- Veterinary use
- Diagnostic procedures
- Therapeutic applications
- Any clinical use

By purchasing from Revive Research, you acknowledge and agree that:

### Purchaser Responsibilities

1. **You are a qualified researcher** or representative of a research institution, academic laboratory, or commercial research organization conducting legitimate scientific research.

2. **Products will be used only for legitimate research purposes** including but not limited to: in vitro studies, cell culture research, biochemical analysis, and other approved laboratory applications.

3. **You will comply with all applicable local, state, and federal regulations** governing the purchase, possession, handling, storage, and disposal of research chemicals.

4. **You will not resell, distribute, or transfer** any products purchased from Revive Research to any third party.

5. **You assume full responsibility** for the proper use, handling, storage, and disposal of all products in accordance with good laboratory practices.

### Product Classification

Our products are classified as:

- **Research Chemicals** - Not approved drugs or biologics
- **Reference Standards** - For analytical and research use
- **Laboratory Reagents** - For in vitro research applications

### Regulatory Status

- Products are **NOT** FDA-approved for any human or veterinary use
- Products are **NOT** intended for diagnostic purposes
- Products have **NOT** undergone clinical trials for safety or efficacy
- Products are sold in compliance with applicable regulations governing research chemicals

### Liability Limitations

Revive Research expressly disclaims any liability for:

- Misuse of products contrary to their intended research purpose
- Adverse effects resulting from improper use or handling
- Consequences of using products for unauthorized applications
- Violations of applicable laws or regulations by the purchaser

### Age Verification

All purchasers must be at least 21 years of age. By completing a purchase, you certify that you meet this age requirement.

---

## Acknowledgment

By placing an order with Revive Research, you acknowledge that you have read, understood, and agree to comply with this Research Use Disclaimer. Violation of these terms may result in order cancellation, account termination, and potential legal action.

For questions about appropriate research use, contact: **compliance@reviveresearch.co**`
      },
      {
        slug: "shipping-handling-policy",
        title: "Shipping & Handling Policy",
        category: "policies",
        summary: "Complete information about our shipping methods, delivery timeframes, and handling procedures.",
        effectiveDate: new Date("2024-01-01"),
        isPublished: true,
        sortOrder: 3,
        content: `# Shipping & Handling Policy

**Last Updated:** November 15, 2024  
**Effective Date:** January 1, 2024

Complete information about our shipping methods, delivery timeframes, and handling procedures.

---

## Shipping Rates

| Order Total | Shipping Cost |
|-------------|---------------|
| Under $200  | $20 flat rate |
| $200+       | **FREE** |

All shipping is via expedited courier service within the continental United States.

## Processing & Delivery

### Same-Day Shipping
Orders placed **before 12:00 PM Central Time** on business days ship the same day.

### Standard Processing
All other orders ship within 24 business hours of placement.

### Delivery Timeframes
- **Standard Delivery:** 2 business days

## Packaging & Handling

### Temperature-Sensitive Products
- Products are packaged with appropriate cold packs when required
- Insulated containers maintain product integrity during transit
- Shipping times are optimized to minimize exposure

### Discrete Packaging
- All orders ship in plain, unmarked packaging
- No product names or descriptions appear on external labels
- Return address shows "RR Scientific" only

### Documentation
Each shipment includes:
- Packing slip with order details
- Certificate of Analysis (COA) for each product
- Storage instructions

## Delivery Requirements

### Signature Confirmation
Orders over $200 require signature upon delivery. Someone must be available to sign for the package.

### Address Accuracy
Please verify your shipping address carefully before completing your order. We cannot redirect packages once shipped.

### P.O. Boxes
We cannot ship to P.O. Boxes due to carrier restrictions.

## International Shipping

**Currently, we only ship within the United States.** 

International shipping may be available in the future. Please contact us for updates.

## Lost or Damaged Packages

### Damaged Shipments
If your package arrives damaged:
1. Take photos of the external packaging and products
2. Contact us within 48 hours of delivery
3. Provide your order number and photos
4. We will investigate and resolve the issue

### Lost Packages
If tracking shows delivered but you haven't received your package:
1. Check with neighbors and building management
2. Wait 24 hours (packages sometimes show delivered early)
3. Contact us with your order number
4. We will file a carrier claim and work toward resolution

---

For shipping inquiries, contact: **shipping@reviveresearch.co**`
      },
      {
        slug: "returns-refunds-policy",
        title: "Returns & Refunds Policy",
        category: "policies",
        summary: "Understanding our no-refund policy and the reasons behind it for research compound integrity.",
        effectiveDate: new Date("2024-01-01"),
        isPublished: true,
        sortOrder: 4,
        content: `# Returns & Refunds Policy

**Last Updated:** November 15, 2024  
**Effective Date:** January 1, 2024

Understanding our no-refund policy and the reasons behind it for research compound integrity.

---

## Important Notice

⚠️ **ALL SALES ARE FINAL. NO REFUNDS ARE ISSUED.**

Due to the sensitive nature of research compounds and strict quality control protocols, we cannot accept returns on any products.

---

## Why No Returns?

Research compounds require strict environmental controls:

### Chain of Custody
Once a product leaves our climate-controlled facility, we cannot verify:
- Storage temperature history
- Exposure to light or humidity
- Handling conditions
- Potential contamination

### Product Integrity
Accepting returns would compromise:
- Quality assurance for other customers
- Scientific reliability of our compounds
- Our reputation for verified, untampered products

### Regulatory Compliance
Re-selling returned research chemicals could violate:
- FDA regulations on product handling
- DEA guidelines (where applicable)
- State and local chemical handling laws

---

## Exceptions

Refunds may be considered **only** in the following cases:

### Shipping Errors
If we shipped the wrong product or quantity:
- Contact us within 48 hours of delivery
- Provide photos of what you received
- Include your order number and batch numbers
- We will investigate and correct our error

### Quality Issues
If you believe you received a defective product:
- Contact us within 48 hours of delivery
- Provide the batch number from your product
- Describe the specific issue in detail
- Include photos if applicable
- Our quality team will investigate

### Order Cancellation
Orders can be cancelled **only before shipping**:
- Given our same-day shipping policy, act quickly
- Contact us immediately after placing an order
- Once shipped, orders cannot be cancelled

---

## Dispute Process

If you have concerns about your order:

1. **Contact Us First** - Email support@reviveresearch.co with your order details
2. **Provide Documentation** - Include photos, batch numbers, and specific issue description
3. **Allow Investigation Time** - We will respond within 2 business days
4. **Resolution** - We will work with you to find an appropriate solution for legitimate issues

---

## Before You Order

We encourage you to:

- ✓ Review product descriptions carefully
- ✓ Verify you're ordering the correct quantity and dosage
- ✓ Confirm your shipping address is accurate
- ✓ Understand the research-only nature of our products
- ✓ Ensure you have appropriate storage facilities

---

For order issues, contact: **support@reviveresearch.co**`
      },
      
      // COMPLIANCE CATEGORY
      {
        slug: "fda-compliance-statement",
        title: "FDA & Regulatory Compliance",
        category: "compliance",
        summary: "Our compliance with FDA regulations and research chemical guidelines.",
        effectiveDate: new Date("2024-01-01"),
        isPublished: true,
        sortOrder: 1,
        content: `# FDA & Regulatory Compliance

**Last Updated:** November 20, 2024  
**Effective Date:** January 1, 2024

Our compliance with FDA regulations and research chemical guidelines.

---

## Regulatory Classification

### Research Chemical Status

Revive Research products are classified as **Research Chemicals** under applicable regulations. They are:

- **NOT** FDA-approved drugs or biologics
- **NOT** dietary supplements
- **NOT** intended for human or animal consumption
- **NOT** intended for diagnostic or therapeutic use

### FDA Disclaimer

**These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease.**

---

## Compliance Framework

### Federal Regulations

We operate in compliance with:

- **Federal Analog Act** - Products are sold for legitimate research purposes only
- **FDA 21 CFR** - Research chemical labeling and documentation requirements
- **TSCA** - Toxic Substances Control Act compliance where applicable
- **DEA Regulations** - Where applicable to controlled substance analogs

### State Regulations

We monitor and comply with state-specific regulations in all jurisdictions where we operate. Some products may not be available in certain states due to local restrictions.

### International Considerations

We currently ship only within the United States. International sales would require compliance with:
- Import/export regulations
- Customs requirements
- Destination country laws

---

## Labeling Standards

All products are labeled with:

- ✓ Complete chemical name
- ✓ Batch/lot number for traceability
- ✓ "For Research Use Only" designation
- ✓ "Not for Human Consumption" warning
- ✓ Storage requirements
- ✓ Manufacturer/supplier information
- ✓ Net weight/quantity

---

## Documentation

### Certificate of Analysis (COA)
Every batch includes a COA with:
- Independent laboratory test results
- Purity specifications
- Identity confirmation
- Batch-specific analysis date

### Material Safety Data Sheets (MSDS)
Available upon request for all products, including:
- Hazard identification
- Handling precautions
- First aid measures
- Storage requirements

---

## Buyer Responsibility

Purchasers are responsible for:

1. **Compliance with Local Laws** - Understanding and following all applicable regulations in their jurisdiction

2. **Proper Use** - Using products only for legitimate research purposes

3. **Documentation** - Maintaining appropriate records of purchase and use

4. **Disposal** - Properly disposing of unused products according to local regulations

---

## Reporting

If you become aware of any misuse of products purchased from Revive Research, please report it to: **compliance@reviveresearch.co**

We take all reports seriously and cooperate fully with law enforcement investigations.

---

For compliance questions, contact: **compliance@reviveresearch.co**`
      },
      {
        slug: "age-verification-policy",
        title: "Age Verification Policy",
        category: "compliance",
        summary: "Requirements and procedures for age verification of all purchasers.",
        effectiveDate: new Date("2024-01-01"),
        isPublished: true,
        sortOrder: 2,
        content: `# Age Verification Policy

**Last Updated:** November 1, 2024  
**Effective Date:** January 1, 2024

Requirements and procedures for age verification of all purchasers.

---

## Age Requirement

**All purchasers must be at least 21 years of age.**

This requirement exists because:
- Research chemicals require mature, responsible handling
- Professional research settings typically require adult supervision
- Legal liability considerations for potentially hazardous materials
- Alignment with industry best practices

---

## Verification Process

### Online Verification

When accessing our website, you will be asked to:

1. **Confirm your age** - Acknowledge that you are 21 years of age or older
2. **Accept Terms** - Agree to our Terms of Service and Research Use policies

### Order Verification

We may verify age through:

- Credit card holder information
- Account registration details
- Shipping address verification
- Random audit requests for ID

### Right to Request Documentation

We reserve the right to:

- Request government-issued photo ID
- Require institutional verification for academic orders
- Decline orders where age cannot be verified
- Cancel accounts if false age information is provided

---

## False Representations

Providing false age information:

- Violates our Terms of Service
- Results in immediate account termination
- May void any orders placed
- Could result in legal action

---

## Parental/Guardian Notice

If you are a parent or guardian and believe a minor has made a purchase:

1. Contact us immediately at support@reviveresearch.co
2. Provide order details if available
3. We will investigate and cancel the order if confirmed
4. The account will be terminated

---

For age verification questions, contact: **support@reviveresearch.co**`
      },
      
      // TERMS & LEGAL CATEGORY
      {
        slug: "terms-of-service",
        title: "Terms of Service",
        category: "terms",
        summary: "Complete terms and conditions governing the use of our website and purchase of products.",
        effectiveDate: new Date("2024-01-01"),
        isPublished: true,
        sortOrder: 1,
        content: `# Terms of Service

**Last Updated:** November 28, 2024  
**Effective Date:** January 1, 2024

Complete terms and conditions governing the use of our website and purchase of products.

---

## 1. Acceptance of Terms

By accessing and using the Revive Research website (the "Site") and purchasing products, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Site or purchase products.

## 2. Eligibility

To use this Site and purchase products, you must:

- Be at least 21 years of age
- Be a qualified researcher or representative of a research institution
- Have the legal capacity to enter into binding agreements
- Not be prohibited from purchasing research chemicals in your jurisdiction

## 3. Research Use Only

**All products are sold exclusively for legitimate research purposes.**

You agree that you will:
- Use products only for in vitro research, laboratory analysis, or other legitimate scientific purposes
- NOT use products for human consumption, veterinary use, or any therapeutic application
- Comply with all applicable laws and regulations
- Maintain appropriate documentation of your research use

## 4. Account Responsibilities

If you create an account, you are responsible for:
- Maintaining the confidentiality of your login credentials
- All activities that occur under your account
- Notifying us immediately of any unauthorized access
- Ensuring your account information is accurate and current

## 5. Orders and Pricing

- All prices are in US dollars and subject to change without notice
- We reserve the right to limit quantities or refuse any order
- Orders are subject to acceptance and product availability
- Payment is due at the time of order

## 6. Intellectual Property

All content on this Site, including text, graphics, logos, and images, is the property of Revive Research and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our written permission.

## 7. Limitation of Liability

**TO THE MAXIMUM EXTENT PERMITTED BY LAW:**

Revive Research shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:
- Use or inability to use our products
- Misuse of products contrary to their intended purpose
- Any errors or omissions in our content
- Unauthorized access to your account

Our total liability shall not exceed the amount paid for the specific product giving rise to the claim.

## 8. Indemnification

You agree to indemnify and hold harmless Revive Research, its officers, directors, employees, and agents from any claims, damages, or expenses arising from:
- Your use of our products
- Your violation of these Terms
- Your violation of any law or regulation
- Any misrepresentation made by you

## 9. Dispute Resolution

Any dispute arising from these Terms shall be:
- First attempted to be resolved through informal negotiation
- Subject to binding arbitration if negotiation fails
- Governed by the laws of the State of Delaware
- Subject to the exclusive jurisdiction of courts in Delaware for any court proceedings

## 10. Modifications

We may modify these Terms at any time. Continued use of the Site after modifications constitutes acceptance of the new Terms. Material changes will be communicated via email or Site notice.

## 11. Severability

If any provision of these Terms is found unenforceable, the remaining provisions shall remain in full force and effect.

## 12. Entire Agreement

These Terms, together with our Privacy Policy and other posted policies, constitute the entire agreement between you and Revive Research.

---

For questions about these Terms, contact: **legal@reviveresearch.co**`
      },
      {
        slug: "privacy-policy",
        title: "Privacy Policy",
        category: "terms",
        summary: "How we collect, use, protect, and share your personal information.",
        effectiveDate: new Date("2024-01-01"),
        isPublished: true,
        sortOrder: 2,
        content: `# Privacy Policy

**Last Updated:** November 28, 2024  
**Effective Date:** January 1, 2024

How we collect, use, protect, and share your personal information.

---

## 1. Information We Collect

### Information You Provide
- **Account Information:** Name, email address, password
- **Order Information:** Shipping address, billing address, payment details
- **Communication:** Emails, support requests, feedback

### Information Collected Automatically
- **Device Information:** Browser type, operating system, device identifiers
- **Usage Data:** Pages visited, time spent, click patterns
- **Location Data:** General geographic location based on IP address

### Cookies and Tracking
We use cookies and similar technologies to:
- Remember your preferences
- Analyze Site usage
- Improve user experience
- Process transactions

## 2. How We Use Your Information

We use collected information to:

- Process and fulfill your orders
- Communicate about your orders and account
- Provide customer support
- Improve our products and services
- Detect and prevent fraud
- Comply with legal obligations
- Send marketing communications (with your consent)

## 3. Information Sharing

We may share your information with:

### Service Providers
- Payment processors (Stripe)
- Shipping carriers
- Email service providers
- Analytics providers

### Legal Requirements
We may disclose information when required by:
- Law enforcement requests
- Court orders
- Legal proceedings
- Regulatory requirements

### Business Transfers
In the event of a merger, acquisition, or sale, your information may be transferred to the new entity.

**We do NOT sell your personal information to third parties.**

## 4. Data Security

We implement industry-standard security measures:

- SSL/TLS encryption for data transmission
- Encrypted storage of sensitive information
- Regular security audits and assessments
- Employee access controls and training
- PCI-DSS compliance for payment processing

## 5. Your Rights

Depending on your location, you may have the right to:

- **Access** your personal information
- **Correct** inaccurate information
- **Delete** your personal information
- **Port** your data to another service
- **Opt-out** of marketing communications
- **Restrict** certain processing activities

To exercise these rights, contact: **privacy@reviveresearch.co**

## 6. Data Retention

We retain your information for:
- **Account Data:** Duration of your account plus 3 years
- **Order History:** 7 years for tax and legal purposes
- **Communication Records:** 3 years from last contact
- **Marketing Preferences:** Until you opt out

## 7. Children's Privacy

Our Site is not intended for individuals under 21. We do not knowingly collect information from minors. If we learn we have collected information from someone under 21, we will delete it immediately.

## 8. International Users

Our Site is operated in the United States. If you access the Site from outside the US, your information will be transferred to and processed in the US, which may have different data protection laws.

## 9. Changes to This Policy

We may update this Privacy Policy periodically. We will notify you of material changes via:
- Email to your registered address
- Prominent notice on our Site
- Updated "Last Modified" date

## 10. Contact Us

For privacy-related questions or concerns:

**Email:** privacy@reviveresearch.co  
**Mail:** Revive Research, Privacy Team, [Address]

---

*This Privacy Policy is effective as of the date listed above.*`
      },
      {
        slug: "intellectual-property",
        title: "Intellectual Property Notice",
        category: "terms",
        summary: "Information about trademarks, copyrights, and intellectual property rights.",
        effectiveDate: new Date("2024-01-01"),
        isPublished: true,
        sortOrder: 3,
        content: `# Intellectual Property Notice

**Last Updated:** November 1, 2024  
**Effective Date:** January 1, 2024

Information about trademarks, copyrights, and intellectual property rights.

---

## Trademarks

The following are trademarks or registered trademarks of Revive Research:

- **Revive Research™** - Company name and brand
- **RR Scientific™** - Trading name
- The Revive Research logo and design elements

These trademarks may not be used without our prior written permission.

## Copyright

All content on the Revive Research website is protected by copyright:

- © 2024 Revive Research. All rights reserved.
- Website design and layout
- Product descriptions and images
- Educational content and articles
- Documentation and policies

### Permitted Uses

You may:
- View and print content for personal, non-commercial use
- Share links to our content
- Quote brief excerpts with proper attribution

### Prohibited Uses

Without written permission, you may not:
- Reproduce content for commercial purposes
- Modify or create derivative works
- Distribute copies of our content
- Use our content on other websites

## Third-Party Content

Some content on our Site may be:
- Licensed from third parties
- Subject to additional restrictions
- Protected by separate intellectual property rights

## Product Names

Product names on our Site may be:
- Common chemical names (not trademarks)
- Research compound designations
- Industry-standard nomenclature

We do not claim trademark rights to standard chemical or peptide names.

## DMCA Notice

If you believe content on our Site infringes your copyright:

1. Send a written notice to our designated agent
2. Include identification of the copyrighted work
3. Identify the infringing material and its location
4. Provide your contact information
5. Include required DMCA statements

**DMCA Agent:** legal@reviveresearch.co

---

For intellectual property questions, contact: **legal@reviveresearch.co**`
      },
      {
        slug: "website-disclaimer",
        title: "Website Disclaimer",
        category: "terms",
        summary: "Disclaimers regarding website content, product information, and liability limitations.",
        effectiveDate: new Date("2024-01-01"),
        isPublished: true,
        sortOrder: 4,
        content: `# Website Disclaimer

**Last Updated:** November 1, 2024  
**Effective Date:** January 1, 2024

Disclaimers regarding website content, product information, and liability limitations.

---

## General Disclaimer

The information provided on the Revive Research website is for general informational purposes only. While we strive for accuracy, we make no representations or warranties about:

- Completeness of information
- Accuracy of product descriptions
- Reliability of third-party content
- Suitability for any particular purpose

## Product Information

### Descriptions
Product descriptions are based on:
- Manufacturer specifications
- Published scientific literature
- Independent laboratory analysis

Descriptions are provided for informational purposes and should not be construed as medical, therapeutic, or health claims.

### Images
Product images are representative. Actual products may vary slightly in:
- Packaging design
- Label appearance
- Container size or shape

### Pricing
While we strive for accuracy, errors may occur. We reserve the right to:
- Correct pricing errors
- Cancel orders affected by errors
- Limit quantities available at any price

## No Medical Advice

**Nothing on this website constitutes medical advice.**

- We are not licensed healthcare providers
- Content is not intended to diagnose, treat, cure, or prevent any disease
- Consult a qualified healthcare professional for medical advice
- Do not use our products for self-treatment

## External Links

Our Site may contain links to third-party websites. We are not responsible for:
- Content on external sites
- Privacy practices of external sites
- Accuracy of third-party information
- Any damages arising from use of external sites

## Limitation of Liability

**TO THE FULLEST EXTENT PERMITTED BY LAW:**

Revive Research shall not be liable for any damages arising from:
- Use or inability to use our website
- Errors or omissions in content
- Interruption of service
- Viruses or other harmful components
- Reliance on any website content

## Indemnification

By using this website, you agree to indemnify Revive Research against any claims arising from your:
- Use of the website
- Violation of these disclaimers
- Infringement of any third-party rights

---

For questions about this disclaimer, contact: **legal@reviveresearch.co**`
      }
    ];
    
    await db.insert(legalDocuments).values(sampleLegalDocuments);
    console.log("Inserted " + sampleLegalDocuments.length + " legal documents");
  }
  
  // Seed Education Articles
  const existingArticles = await db.select().from(educationArticles);
  if (existingArticles.length === 0) {
    console.log("Inserting education articles...");
    
    const sampleEducationArticles = [
      {
        slug: "understanding-peptide-purity",
        title: "Understanding Peptide Purity: A Comprehensive Guide",
        category: "basics",
        summary: "Learn how peptide purity is measured, what affects it, and why it matters for your research outcomes.",
        content: `# Understanding Peptide Purity

Peptide purity is one of the most critical factors in research applications. This guide explains how purity is measured, what affects it, and why it matters.

## What is Peptide Purity?

Peptide purity refers to the percentage of the target peptide in a sample, excluding impurities such as:
- Deletion sequences
- Truncated peptides
- Oxidized forms
- Salt content
- Residual solvents

## Measuring Purity

### HPLC Analysis
High-Performance Liquid Chromatography (HPLC) is the gold standard for purity assessment:
- Separates peptides based on hydrophobicity
- Provides quantitative purity percentage
- Detects related impurities

### Mass Spectrometry
Confirms molecular identity and detects:
- Correct molecular weight
- Modifications
- Degradation products

## Purity Grades

| Grade | Purity | Typical Use |
|-------|--------|-------------|
| Research | >95% | General research |
| High Purity | >98% | Sensitive assays |
| Ultra Pure | >99% | In vivo studies |

## Why Purity Matters

Higher purity ensures:
- Reproducible results
- Accurate dose-response
- Reduced experimental noise
- Valid conclusions

Always match purity grade to your research requirements.`,
        readTime: 8,
        isPublished: true,
        sortOrder: 1
      },
      {
        slug: "reconstitution-101",
        title: "Reconstitution 101: How to Prepare Lyophilized Peptides",
        category: "basics",
        summary: "A practical guide to properly reconstituting lyophilized peptide compounds using bacteriostatic water for research applications.",
        content: `# Reconstitution 101: How to Prepare Lyophilized Peptides

Lyophilized (freeze-dried) peptides must be properly reconstituted before use in research applications. This guide covers the essential steps, calculations, and best practices for preparing your peptides correctly.

## What You Will Need

Before beginning, gather these materials:
- Lyophilized peptide vial
- Bacteriostatic water (BAC water) with 0.9% benzyl alcohol
- Sterile syringes (1mL insulin syringes work well)
- Alcohol swabs for sanitization
- Clean work surface

## Why Bacteriostatic Water?

Bacteriostatic water contains 0.9% benzyl alcohol, which serves as a preservative. This is critical because:
- **Prevents bacterial growth** after multiple withdrawals from the vial
- **Extends shelf life** of reconstituted peptides to 2-4 weeks refrigerated
- **Allows multi-use** - you can draw from the same vial multiple times safely

**Note:** Plain sterile water should only be used for single-use applications, as it has no preservative to prevent contamination.

## Step-by-Step Reconstitution Process

### Step 1: Prepare Your Workspace
- Clean your work surface with alcohol
- Wash hands thoroughly or wear sterile gloves
- Allow refrigerated BAC water to reach room temperature (10-15 minutes)

### Step 2: Sanitize the Vial Tops
- Wipe the rubber stopper of both the peptide vial and BAC water vial with alcohol swabs
- Allow to air dry for 10-15 seconds

### Step 3: Withdraw BAC Water
- Using a sterile syringe, draw your desired volume of BAC water
- Remove any air bubbles by tapping the syringe and pushing them out

### Step 4: Add BAC Water to Peptide
- Insert the needle through the rubber stopper at a slight angle
- **Critical:** Aim the stream at the glass wall of the vial, NOT directly at the powder
- Slowly release the water, letting it run gently down the side
- This prevents damaging the peptide structure

### Step 5: Allow to Dissolve
- Let the vial sit for 2-3 minutes
- **Do NOT shake the vial** - this can denature the peptide
- Gently roll the vial between your palms if needed
- The solution should become clear with no visible particles

## Calculating Reconstitution Volume

Choose your volume based on desired concentration:

| Amount of Peptide | BAC Water Added | Concentration |
|-------------------|-----------------|---------------|
| 5mg | 1mL | 5mg/mL (5000mcg/mL) |
| 5mg | 2mL | 2.5mg/mL (2500mcg/mL) |
| 10mg | 2mL | 5mg/mL (5000mcg/mL) |
| 10mg | 5mL | 2mg/mL (2000mcg/mL) |

**Example calculation:**
If you have 5mg peptide and add 2mL BAC water:
- Concentration = 5mg / 2mL = 2.5mg per mL
- Each 0.1mL (10 units on insulin syringe) = 250mcg

## Storage After Reconstitution

Once reconstituted, peptides have a limited shelf life:

- **Refrigerated (2-8C):** 2-4 weeks with BAC water
- **Frozen (-20C):** Not recommended for reconstituted peptides
- **Room temperature:** Use within 24-48 hours maximum

**Best practices:**
- Store upright in the refrigerator
- Keep away from light
- Note the reconstitution date on the vial
- Discard if solution becomes cloudy or discolored

## Common Mistakes to Avoid

**1. Spraying water directly on the powder**
This can damage peptide bonds. Always aim at the glass wall.

**2. Shaking the vial**
Gentle rolling is fine; vigorous shaking can denature the peptide.

**3. Using tap or distilled water**
Only use sterile bacteriostatic water to prevent contamination.

**4. Storing at room temperature**
Reconstituted peptides degrade quickly without refrigeration.

**5. Reusing syringes**
Always use a fresh, sterile syringe for each withdrawal.

## Signs of Degradation

Discard reconstituted peptides if you observe:
- Cloudiness or particles in solution
- Color changes
- Unusual odor
- Solution was stored incorrectly

## Summary

Proper reconstitution ensures your research compounds maintain integrity and provide consistent results. The key points to remember:

1. Use bacteriostatic water for multi-use reconstitution
2. Add water gently to the vial wall
3. Never shake - roll gently if needed
4. Refrigerate immediately after reconstitution
5. Use within 2-4 weeks

Following these guidelines will help ensure the quality and consistency of your research applications.`,
        readTime: 6,
        isPublished: true,
        sortOrder: 2
      },
      {
        slug: "proper-peptide-storage",
        title: "Proper Peptide Storage and Handling",
        category: "storage",
        summary: "Essential guidelines for storing and handling peptides to maintain stability and integrity.",
        content: `# Proper Peptide Storage and Handling

Proper storage is essential to maintain peptide integrity and maximize shelf life.

## Storage Temperature

### Lyophilized (Powder) Form
- **Optimal:** -20°C or below
- **Acceptable:** 2-8°C for short-term
- **Avoid:** Room temperature for extended periods

### Reconstituted Peptides
- **Required:** 2-8°C (refrigerated)
- **Maximum storage:** 2-4 weeks
- **Best practice:** Aliquot and freeze at -20°C

## Light Protection

Many peptides are light-sensitive:
- Store in amber vials or wrapped containers
- Minimize exposure during handling
- Work in reduced lighting when possible

## Moisture Protection

Lyophilized peptides are hygroscopic:
- Keep containers sealed
- Use desiccants when appropriate
- Minimize freeze-thaw cycles

## Reconstitution Guidelines

1. Allow vial to reach room temperature
2. Use appropriate solvent (usually bacteriostatic water)
3. Add solvent slowly to the vial wall
4. Gently swirl - do not vortex
5. Allow complete dissolution before use

## Signs of Degradation

Watch for these warning signs:
- Color changes
- Precipitation
- Unusual odor
- Reduced activity

Following these guidelines will help ensure consistent research results.`,
        readTime: 6,
        isPublished: true,
        sortOrder: 2
      },
      {
        slug: "reading-coa-documents",
        title: "How to Read and Interpret COA Documents",
        category: "coa-guide",
        summary: "A step-by-step guide to understanding Certificates of Analysis and what each test result means.",
        content: `# How to Read and Interpret COA Documents

Understanding your Certificate of Analysis (COA) is essential for validating product quality.

## What is a COA?

A Certificate of Analysis documents:
- Product identity confirmation
- Purity analysis results
- Quality specifications
- Batch-specific information

## Key Components

### Header Information
- Product name and catalog number
- Batch/lot number
- Manufacturing date
- Expiration date

### Identity Tests

**Mass Spectrometry**
- Expected molecular weight
- Observed molecular weight
- Should match within ±0.5 Da

### Purity Tests

**HPLC Analysis**
- Method description
- Purity percentage
- Specification (minimum acceptable)
- Result (actual measured)

### Additional Tests

**Endotoxin (LAL)**
- Measures bacterial endotoxin
- Important for biological assays
- Typically <0.5 EU/mg

**Sterility**
- Microbiological testing
- Should show "Negative" or "Pass"

**Peptide Content**
- Net peptide percentage
- Accounts for salt and moisture

## Interpreting Results

✅ **Pass:** Result meets specification
❌ **Fail:** Result outside acceptable range

All specifications should show "Pass" for quality products.

## Verification

Always verify your COA:
1. Match batch number to your product
2. Confirm test dates are current
3. Check that lab is accredited
4. Verify all tests passed`,
        readTime: 10,
        isPublished: true,
        sortOrder: 3
      },
      {
        slug: "peptide-research-applications",
        title: "Common Peptide Research Applications",
        category: "basics",
        summary: "Overview of how peptides are used in various research fields including biochemistry, cell biology, and more.",
        content: `# Common Peptide Research Applications

Peptides are versatile research tools used across many scientific disciplines.

## Biochemistry Research

### Enzyme Studies
- Substrate analogs
- Inhibitor development
- Mechanism investigation

### Protein-Protein Interactions
- Binding domain mapping
- Interaction validation
- Competition assays

## Cell Biology

### Cell Signaling
- Receptor activation studies
- Pathway analysis
- Signal transduction research

### Cell Culture
- Growth factor supplementation
- Differentiation protocols
- Viability assays

## Drug Discovery

### Lead Optimization
- Structure-activity relationships
- Binding affinity studies
- Selectivity profiling

### Target Validation
- Functional studies
- Mechanism of action
- Biomarker development

## Structural Biology

### NMR Studies
- Conformational analysis
- Dynamics investigation
- Binding studies

### X-ray Crystallography
- Complex formation
- Structural determination
- Binding mode analysis

## Immunology

### Antibody Development
- Immunogen preparation
- Epitope mapping
- ELISA standards

### Vaccine Research
- Antigen design
- Immune response studies
- Carrier conjugates

This overview represents just a fraction of peptide research applications. Always design experiments appropriate to your specific research questions.`,
        readTime: 7,
        isPublished: true,
        sortOrder: 4
      },
      {
        slug: "lab-safety-guidelines",
        title: "Laboratory Safety Guidelines for Peptide Research",
        category: "safety",
        summary: "Essential safety protocols and best practices for working with research peptides in laboratory settings.",
        content: `# Laboratory Safety Guidelines for Peptide Research

Safety should be the top priority when working with any research chemicals.

## General Safety Principles

### Personal Protective Equipment (PPE)
- Lab coat (always)
- Safety glasses or goggles
- Appropriate gloves (nitrile recommended)
- Closed-toe shoes

### Engineering Controls
- Work in well-ventilated areas
- Use fume hoods when appropriate
- Maintain clean work surfaces
- Proper waste disposal containers

## Handling Procedures

### Weighing
- Use analytical balances
- Minimize powder dispersal
- Clean equipment after use
- Document quantities accurately

### Reconstitution
- Use appropriate solvents
- Follow sterile technique when needed
- Avoid generating aerosols
- Dispose of sharps properly

## Emergency Procedures

### Spill Response
1. Notify others in the area
2. Don appropriate PPE
3. Contain the spill
4. Clean with appropriate materials
5. Dispose of waste properly
6. Document the incident

### Exposure Response
- Skin contact: Wash thoroughly with soap and water
- Eye contact: Rinse with eyewash for 15 minutes
- Inhalation: Move to fresh air
- Seek medical attention if symptoms persist

## Documentation

Maintain records of:
- Material Safety Data Sheets (MSDS)
- Chemical inventory
- Training completion
- Incident reports

## Waste Disposal

- Follow institutional guidelines
- Separate chemical waste streams
- Label all waste containers
- Never dispose of chemicals in regular trash

Always consult your institution's safety officer for site-specific requirements.`,
        readTime: 9,
        isPublished: true,
        sortOrder: 5
      },
      {
        slug: "peptide-research-glossary",
        title: "Peptide Research Glossary: Essential Terms",
        category: "glossary",
        summary: "A comprehensive glossary of terms commonly used in peptide research and quality testing.",
        content: `# Peptide Research Glossary

A comprehensive reference of terms commonly used in peptide research.

## A

**Amino Acid**
The building blocks of peptides and proteins. There are 20 standard amino acids used in biological systems.

**Acetylation**
The addition of an acetyl group (-COCH3) to the N-terminus of a peptide, often used to increase stability.

**Amidation**
The conversion of the C-terminal carboxyl group to an amide, which can increase peptide activity and stability.

## B-C

**Bacteriostatic Water**
Sterile water containing a small amount of benzyl alcohol as a preservative, commonly used for reconstituting peptides.

**COA (Certificate of Analysis)**
Documentation verifying the identity, purity, and quality of a peptide batch.

**Cyclization**
The process of forming a ring structure within a peptide, often increasing stability and bioactivity.

## D-E

**Dalton (Da)**
The unit of molecular mass used to express peptide weight. One Dalton equals one atomic mass unit.

**Endotoxin**
A component of gram-negative bacterial cell walls that can contaminate peptide preparations.

**EU/mg (Endotoxin Units per milligram)**
The measurement unit for endotoxin contamination levels.

## H-L

**HPLC (High-Performance Liquid Chromatography)**
The primary analytical technique used to determine peptide purity.

**Lyophilization**
Freeze-drying process that removes water from peptides to create stable, powder form products.

**LAL Test (Limulus Amebocyte Lysate)**
The standard test for detecting bacterial endotoxins in peptide preparations.

## M-P

**Mass Spectrometry (MS)**
Analytical technique that measures the mass-to-charge ratio of ions to confirm peptide identity.

**Molecular Weight (MW)**
The sum of atomic weights of all atoms in a molecule, expressed in Daltons.

**Peptide Content**
The percentage of actual peptide in a sample, accounting for salt and water content.

**Purity**
The percentage of target peptide in a sample, as determined by HPLC analysis.

## R-S

**Reconstitution**
The process of dissolving lyophilized peptide powder in a suitable solvent.

**Sequence**
The specific order of amino acids in a peptide chain.

**Sterility**
The absence of viable microorganisms in a peptide preparation.

## T-Z

**TFA (Trifluoroacetic Acid)**
A common counter-ion used in peptide synthesis that may be present as a salt form.

**Truncation**
The presence of peptides missing one or more amino acids from the intended sequence.

**Yield**
The amount of peptide obtained after synthesis and purification.`,
        readTime: 5,
        isPublished: true,
        sortOrder: 6
      }
    ];
    
    await db.insert(educationArticles).values(sampleEducationArticles);
    console.log("Inserted " + sampleEducationArticles.length + " education articles");
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
