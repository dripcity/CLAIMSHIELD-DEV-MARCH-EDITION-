# Requirements Document

## Introduction

ClaimShield DV is a consumer-first, AI-powered SaaS platform that generates professional diminished value (DV) vehicle appraisal reports. The platform guides vehicle owners, attorneys, professional appraisers, and body shops through creating legally-defensible DV appraisals using the comparable sales method. The system leverages AI to extract data from uploaded documents, automatically searches for comparable vehicles, performs precise calculations using legally-recognized methodologies, and generates comprehensive 15-25 page PDF reports with state-specific legal citations.

## Glossary

- **Platform**: The ClaimShield DV web application system
- **Appraisal_Wizard**: The 8-step guided interface for creating DV appraisals
- **AI_Extraction_Engine**: The Gemini 3.1 Pro-powered document analysis system
- **Calculation_Engine**: The valuation computation system using median-based comparable sales method
- **Report_Generator**: The PDF generation system producing professional appraisal reports
- **Comparable_Vehicle**: A similar vehicle used for market value comparison
- **DV_Amount**: Diminished Value - the difference between pre-accident and post-repair market value
- **NAAA_Grade**: National Auto Auction Association condition grading scale (1-5)
- **Severity_Classifier**: The system that determines damage severity levels (1-5)
- **Document_Template_Engine**: The system generating demand letters and legal documents
- **Auth_System**: Clerk-based authentication and authorization system
- **Storage_System**: Vercel Blob-based file storage with private access
- **Payment_System**: Stripe-based subscription and payment processing
- **Email_System**: SendGrid-based email delivery system
- **Scraping_System**: Apify-based web scraping for comparable vehicle search

## Requirements

### Requirement 1: User Authentication and Authorization

**User Story:** As a user, I want to securely create an account and access the platform, so that my appraisal data remains private and protected.

#### Acceptance Criteria

1. THE Auth_System SHALL authenticate users via Clerk
2. WHEN a user creates an account, THE Auth_System SHALL assign a unique user identifier
3. THE Auth_System SHALL protect all application routes requiring authentication
4. WHEN a user attempts to access a protected route without authentication, THE Auth_System SHALL redirect to the sign-in page
5. THE Auth_System SHALL support role-based access with roles: individual, appraiser, attorney, body_shop, admin
6. WHEN a new user completes first authentication, THE Platform SHALL redirect to role selection
7. THE Auth_System SHALL store user role in the database
8. THE Platform SHALL restrict access to features based on user role
9. THE Auth_System SHALL ensure users can only access their own appraisal data
10. THE Platform SHALL validate user ownership on all database queries for appraisals

### Requirement 2: Appraisal Creation Wizard

**User Story:** As a vehicle owner, I want to be guided through creating a DV appraisal step-by-step, so that I provide all necessary information without confusion.

#### Acceptance Criteria

1. THE Appraisal_Wizard SHALL provide 8 sequential steps for appraisal creation
2. THE Appraisal_Wizard SHALL display progress indication showing current step and total steps
3. WHEN a user navigates between steps, THE Appraisal_Wizard SHALL preserve entered data
4. THE Appraisal_Wizard SHALL auto-save draft data every 30 seconds
5. WHEN a user returns to an incomplete appraisal, THE Appraisal_Wizard SHALL resume from the last completed step
6. THE Appraisal_Wizard SHALL validate required fields before allowing step progression
7. THE Appraisal_Wizard SHALL display inline validation errors for invalid field values
8. THE Appraisal_Wizard SHALL allow users to navigate backward to previous steps
9. THE Appraisal_Wizard SHALL mark optional fields clearly
10. THE Appraisal_Wizard SHALL be responsive for mobile, tablet, and desktop viewports

### Requirement 3: AI-Powered Document Analysis

**User Story:** As a user, I want to upload my repair estimate and insurance documents, so that the system can automatically extract data and pre-fill form fields.

#### Acceptance Criteria

1. THE Platform SHALL provide a document upload interface accepting PDF and image files
2. THE Platform SHALL accept file types: image/jpeg, image/png, image/webp, application/pdf
3. THE Platform SHALL enforce a maximum file size of 25MB per file
4. THE Platform SHALL enforce a maximum of 20 files per appraisal
5. WHEN a user uploads a repair estimate, THE AI_Extraction_Engine SHALL extract repair cost, labor hours, and component details
6. WHEN a user uploads insurance documents, THE AI_Extraction_Engine SHALL extract owner information, insurance company, policy number, and claim number
7. WHEN a user uploads vehicle documents, THE AI_Extraction_Engine SHALL extract VIN, year, make, model, trim, and mileage
8. WHEN a user uploads before and after photos, THE AI_Extraction_Engine SHALL analyze damage severity and identify damaged components
9. THE AI_Extraction_Engine SHALL return structured JSON data matching the appraisal schema
10. THE AI_Extraction_Engine SHALL include confidence scores for extracted data fields
11. WHEN extraction completes, THE Platform SHALL display extracted data for user review
12. THE Platform SHALL allow users to accept or reject each extracted field
13. THE Platform SHALL mark auto-filled fields with a visual indicator
14. THE Platform SHALL never overwrite user-edited fields with extracted data
15. IF extraction fails, THE Platform SHALL display an error message and allow manual entry
16. THE Platform SHALL process document extraction within 10 seconds per document
17. THE AI_Extraction_Engine SHALL use Gemini 3.1 Pro API for all document analysis
18. THE Platform SHALL not expose the Gemini API key to client-side code

### Requirement 4: File Upload and Storage

**User Story:** As a user, I want to upload repair estimates, photos, and documents, so that they are securely stored and attached to my appraisal.

#### Acceptance Criteria

1. THE Storage_System SHALL store all uploaded files in Vercel Blob storage
2. THE Storage_System SHALL enforce private access for all uploaded files
3. THE Storage_System SHALL generate signed URLs for file access
4. THE Storage_System SHALL organize files by appraisal ID and file type
5. WHEN a user uploads a file, THE Platform SHALL display upload progress
6. WHEN upload completes, THE Platform SHALL save the file URL to the database
7. THE Platform SHALL display uploaded files with filename, size, and upload date
8. THE Platform SHALL allow users to preview PDF files in a new tab
9. THE Platform SHALL allow users to preview image files inline
10. THE Platform SHALL allow users to delete uploaded files
11. WHEN a user deletes a file, THE Platform SHALL remove it from Blob storage and nullify the database reference
12. THE Platform SHALL support drag-and-drop file upload
13. THE Platform SHALL support click-to-browse file upload
14. THE Platform SHALL display file type icons for uploaded files
15. THE Platform SHALL show error messages for files exceeding size limits
16. THE Platform SHALL show error messages for unsupported file types

### Requirement 5: VIN Decoding and Vehicle Information

**User Story:** As a user, I want to enter my vehicle's VIN, so that the system automatically populates vehicle details.

#### Acceptance Criteria

1. WHEN a user enters a 17-character VIN, THE Platform SHALL validate the VIN format
2. WHEN a valid VIN is entered, THE Platform SHALL decode the VIN to extract year, make, model, trim, engine, transmission, and body style
3. THE Platform SHALL populate vehicle detail fields with decoded VIN data
4. THE Platform SHALL allow users to override auto-populated vehicle fields
5. IF VIN decoding fails, THE Platform SHALL display an error message and allow manual entry
6. THE Platform SHALL validate that the VIN contains exactly 17 alphanumeric characters
7. THE Platform SHALL display standard equipment based on VIN decode results
8. THE Platform SHALL allow users to add optional equipment not included in VIN decode

### Requirement 6: Comparable Vehicle Search

**User Story:** As a user, I want the system to automatically find comparable vehicles, so that I don't have to manually search multiple websites.

#### Acceptance Criteria

1. THE Scraping_System SHALL search for pre-accident comparable vehicles with no accident history
2. THE Scraping_System SHALL search for post-accident comparable vehicles with reported accident history
3. THE Scraping_System SHALL search within a configurable radius in miles from the owner's location
4. THE Scraping_System SHALL filter results by year, make, model, and trim matching the subject vehicle
5. THE Scraping_System SHALL filter results by mileage within a configurable tolerance
6. THE Scraping_System SHALL return a minimum of 3 comparable vehicles per search
7. THE Scraping_System SHALL return a maximum of 5 comparable vehicles per search
8. IF fewer than 3 comparables are found, THE Scraping_System SHALL expand search radius and mileage tolerance
9. THE Scraping_System SHALL extract VIN, mileage, listing price, dealer name, location, and listing URL for each comparable
10. THE Scraping_System SHALL use Apify for web scraping operations
11. THE Platform SHALL display search results within 15 seconds
12. THE Platform SHALL display a loading indicator during comparable search
13. THE Platform SHALL allow users to manually add comparable vehicles
14. THE Platform SHALL allow users to remove auto-found comparable vehicles from calculations
15. THE Platform SHALL allow users to edit comparable vehicle details
16. THE Platform SHALL save all comparable vehicles to the database linked to the appraisal

### Requirement 7: Valuation Calculations

**User Story:** As a user, I want the system to calculate diminished value using legally-recognized methodology, so that my appraisal is defensible in insurance claims and legal proceedings.

#### Acceptance Criteria

1. THE Calculation_Engine SHALL calculate pre-accident fair market value using the median of adjusted comparable vehicle values
2. THE Calculation_Engine SHALL calculate post-repair actual cash value using the median of adjusted comparable vehicle values
3. THE Calculation_Engine SHALL calculate diminished value as the difference between pre-accident FMV and post-repair ACV
4. THE Calculation_Engine SHALL apply mileage adjustments at exactly $0.12 per mile difference
5. THE Calculation_Engine SHALL apply equipment adjustments at exactly 80% of factory MSRP
6. THE Calculation_Engine SHALL apply year adjustments at exactly 7% per year for vehicles under 5 years old
7. THE Calculation_Engine SHALL apply condition adjustments using NAAA grade multipliers
8. THE Calculation_Engine SHALL calculate DV as a percentage of pre-accident value
9. THE Calculation_Engine SHALL calculate DV as a percentage of repair cost
10. THE Calculation_Engine SHALL use median calculation method, not mean
11. THE Calculation_Engine SHALL calculate confidence ranges using 10th and 90th percentiles
12. THE Calculation_Engine SHALL store all calculation results in the database
13. THE Calculation_Engine SHALL recalculate values when comparable vehicles are added, removed, or modified
14. THE Calculation_Engine SHALL display all adjustment breakdowns for each comparable vehicle
15. THE Calculation_Engine SHALL display final adjusted value for each comparable vehicle

### Requirement 8: Damage Severity Classification

**User Story:** As a user, I want the system to automatically classify damage severity, so that the appraisal accurately reflects the extent of repairs.

#### Acceptance Criteria

1. THE Severity_Classifier SHALL classify damage into 5 severity levels: Minor, Moderate, Medium, Major, Severe
2. WHEN total labor hours exceed 60, THE Severity_Classifier SHALL assign Level 5 (Severe)
3. WHEN airbag deployment AND structural damage AND frame labor hours exceed 5, THE Severity_Classifier SHALL assign Level 5 (Severe)
4. WHEN frame labor hours exceed 10, THE Severity_Classifier SHALL assign Level 5 (Severe)
5. WHEN frame pulling is required, THE Severity_Classifier SHALL assign Level 4 (Major)
6. WHEN frame labor hours exceed 0, THE Severity_Classifier SHALL assign Level 4 (Major)
7. WHEN structural damage AND total labor hours exceed 35, THE Severity_Classifier SHALL assign Level 4 (Major)
8. WHEN airbag deployment AND total labor hours exceed 30, THE Severity_Classifier SHALL assign Level 4 (Major)
9. WHEN total labor hours are between 20 and 35, THE Severity_Classifier SHALL assign Level 3 (Medium)
10. WHEN structural panels are replaced AND total labor hours exceed 15, THE Severity_Classifier SHALL assign Level 3 (Medium)
11. WHEN airbag deployment occurs without other major factors, THE Severity_Classifier SHALL assign Level 3 (Medium)
12. WHEN total labor hours are between 10 and 20 AND no structural damage, THE Severity_Classifier SHALL assign Level 2 (Moderate)
13. WHEN total labor hours are less than 10, THE Severity_Classifier SHALL assign Level 1 (Minor)
14. THE Severity_Classifier SHALL generate a justification narrative explaining the severity classification
15. THE Severity_Classifier SHALL determine post-repair NAAA grade based on severity level
16. WHEN severity is Level 5, THE Severity_Classifier SHALL assign NAAA grade "1 - Rough"
17. WHEN severity is Level 4, THE Severity_Classifier SHALL assign NAAA grade "2 - Below Average"
18. WHEN severity is Level 3, THE Severity_Classifier SHALL assign NAAA grade "3 - Average"
19. WHEN severity is Level 2, THE Severity_Classifier SHALL assign NAAA grade "4 - Good"
20. WHEN severity is Level 1 AND pre-accident grade was excellent, THE Severity_Classifier SHALL assign NAAA grade "4 - Good"
21. WHEN severity is Level 1 AND pre-accident grade was not excellent, THE Severity_Classifier SHALL assign NAAA grade "3 - Average"

### Requirement 9: Narrative Generation

**User Story:** As a user, I want the system to generate professional narrative text, so that my appraisal report reads like it was written by an expert.

#### Acceptance Criteria

1. THE Platform SHALL generate a repair analysis narrative based on accident details and severity classification
2. THE Platform SHALL generate a market stigma analysis narrative based on DV calculations and damage severity
3. THE Platform SHALL generate component-by-component analysis for all replaced panels
4. THE Platform SHALL generate frame work explanations when frame labor hours exceed 0
5. THE Platform SHALL generate airbag deployment impact statements when airbags were deployed
6. THE Platform SHALL generate paint and refinishing analysis when refinish labor hours exceed 0
7. THE Platform SHALL generate structural damage explanations when structural panels are replaced
8. THE Platform SHALL generate CARFAX and AutoCheck impact statements
9. THE Platform SHALL generate buyer concern narratives specific to damage severity
10. THE Platform SHALL include industry statistics on buyer resistance to accident-history vehicles
11. THE Platform SHALL generate narratives using professional appraisal language
12. THE Platform SHALL insert calculated values into narrative templates
13. THE Platform SHALL generate severity justification narratives matching the classification logic
14. THE Platform SHALL generate NAAA grade downgrade explanations

### Requirement 10: State-Specific Legal Citations

**User Story:** As a user, I want the system to include legal citations specific to my state, so that my appraisal references applicable laws.

#### Acceptance Criteria

1. THE Platform SHALL detect the owner's state from the address field
2. WHEN the owner state is Georgia, THE Platform SHALL cite O.C.G.A. § 33-4-6 for first-party claims
3. WHEN the owner state is Georgia, THE Platform SHALL cite O.C.G.A. § 33-4-7 for third-party claims
4. WHEN the owner state is Georgia, THE Platform SHALL include the anti-17c formula statement
5. WHEN the owner state is Georgia, THE Platform SHALL cite Canal Ins. Co. v. Tullis, 237 Ga. App. 515, 516-17 (1999)
6. WHEN the owner state is North Carolina, THE Platform SHALL cite N.C. Gen. Stat. § 20-279.21(d)(1)
7. WHEN the owner state is not Georgia or North Carolina, THE Platform SHALL cite Restatement of Torts § 928
8. THE Platform SHALL never hardcode Georgia law for non-Georgia appraisals
9. THE Platform SHALL include methodology citations for the comparable sales method
10. THE Platform SHALL explain why the 17c formula is rejected for Georgia appraisals

### Requirement 11: PDF Report Generation

**User Story:** As a user, I want to generate a professional PDF appraisal report, so that I can submit it to my insurance company or attorney.

#### Acceptance Criteria

1. THE Report_Generator SHALL produce a PDF report containing all 14 required sections
2. THE Report_Generator SHALL include a cover page with vehicle information and DV amount
3. THE Report_Generator SHALL include a cover letter with formal introduction
4. THE Report_Generator SHALL include purpose, scope, and intended use section
5. THE Report_Generator SHALL include complete vehicle information in table format
6. THE Report_Generator SHALL include pre-accident condition assessment with NAAA grading
7. THE Report_Generator SHALL include accident and damage summary with repair details
8. THE Report_Generator SHALL include pre-accident comparable vehicles with adjustment breakdowns
9. THE Report_Generator SHALL include post-accident comparable vehicles with adjustment breakdowns
10. THE Report_Generator SHALL include valuation analysis with side-by-side comparison
11. THE Report_Generator SHALL include damage severity analysis with classification
12. THE Report_Generator SHALL include market stigma and buyer perception narrative
13. THE Report_Generator SHALL include state-specific legal citations
14. THE Report_Generator SHALL include disclaimers and certifications
15. THE Report_Generator SHALL attach uploaded repair estimates as appendices
16. THE Report_Generator SHALL display page numbers on every page
17. THE Report_Generator SHALL display header with "ClaimShield DV — Diminished Value Appraisal" on every page
18. THE Report_Generator SHALL highlight the DV amount in a green box on the cover page
19. THE Report_Generator SHALL format all dollar amounts with commas and dollar signs
20. THE Report_Generator SHALL use professional blue and white color scheme
21. THE Report_Generator SHALL generate reports with minimum 15 pages for complete appraisals
22. THE Report_Generator SHALL complete PDF generation within 45 seconds
23. THE Report_Generator SHALL upload generated PDFs to Vercel Blob storage
24. THE Report_Generator SHALL save the PDF URL to the database
25. THE Report_Generator SHALL use @react-pdf/renderer for PDF generation
26. WHEN a professional appraiser creates an appraisal, THE Report_Generator SHALL include USPAP compliance statements
27. THE Report_Generator SHALL include appraiser signature when provided
28. THE Report_Generator SHALL display structural damage indicators in amber warning boxes

### Requirement 12: Report Preview and Download

**User Story:** As a user, I want to preview my generated report before downloading, so that I can verify all information is correct.

#### Acceptance Criteria

1. THE Platform SHALL display a report preview page after PDF generation
2. THE Platform SHALL embed the generated PDF in an iframe or embed element
3. THE Platform SHALL display the DV amount prominently above the preview
4. THE Platform SHALL provide a download button for the PDF
5. THE Platform SHALL provide an email report button
6. THE Platform SHALL provide a regenerate button to recreate the PDF
7. WHEN a user clicks regenerate, THE Platform SHALL recalculate all values and generate a new PDF
8. THE Platform SHALL display a loading indicator during PDF generation
9. THE Platform SHALL poll for generation status or use server-sent events
10. IF PDF generation fails, THE Platform SHALL display an error message with retry option

### Requirement 13: Document Template Generation

**User Story:** As a user, I want to generate demand letters and legal documents, so that I can negotiate with my insurance company.

#### Acceptance Criteria

1. THE Document_Template_Engine SHALL generate 7 document templates
2. THE Document_Template_Engine SHALL generate a full DV appraisal summary (1-page executive summary)
3. WHEN the owner state is Georgia, THE Document_Template_Engine SHALL generate a Georgia 60-day demand letter citing O.C.G.A. § 33-4-6 or § 33-4-7
4. WHEN the owner state is not Georgia, THE Document_Template_Engine SHALL generate a generic demand letter with tort law citations
5. WHEN the owner state is Georgia, THE Document_Template_Engine SHALL generate a bad faith penalty calculator letter
6. THE Document_Template_Engine SHALL generate an insurance negotiation response template
7. WHEN the user is a professional appraiser, THE Document_Template_Engine SHALL generate an expert witness affidavit with USPAP certification
8. THE Document_Template_Engine SHALL generate a market stigma impact statement
9. THE Document_Template_Engine SHALL substitute all template variables with appraisal data
10. THE Document_Template_Engine SHALL replace {{variable}} placeholders with actual values
11. THE Platform SHALL display all available templates with availability status
12. THE Platform SHALL lock templates not applicable to the user's state or role
13. THE Platform SHALL provide preview buttons for each template
14. THE Platform SHALL provide download as PDF buttons for each template
15. THE Platform SHALL provide download as DOCX buttons for each template
16. THE Platform SHALL use the docx npm package for Word document export
17. THE Platform SHALL display templates in a modal for preview

### Requirement 14: Payment Processing

**User Story:** As a user, I want to purchase individual reports or subscribe to a plan, so that I can generate appraisal reports.

#### Acceptance Criteria

1. THE Payment_System SHALL integrate with Stripe for payment processing
2. THE Payment_System SHALL offer an individual report purchase at $129 per report
3. THE Payment_System SHALL offer a professional monthly subscription at $299 per month
4. THE Payment_System SHALL offer an attorney monthly subscription at $499 per month
5. THE Payment_System SHALL offer a body shop monthly subscription at $399 per month
6. WHEN a user purchases an individual report, THE Payment_System SHALL unlock PDF generation for one appraisal
7. WHEN a user subscribes to a plan, THE Payment_System SHALL unlock unlimited report generation
8. THE Payment_System SHALL create a Stripe checkout session for purchases
9. THE Payment_System SHALL redirect users to Stripe hosted checkout page
10. THE Payment_System SHALL handle Stripe webhook events for payment confirmation
11. WHEN a checkout.session.completed event is received, THE Payment_System SHALL unlock report generation
12. WHEN a customer.subscription.created event is received, THE Payment_System SHALL set user role based on plan
13. WHEN a customer.subscription.deleted event is received, THE Payment_System SHALL downgrade user access
14. WHEN an invoice.payment_failed event is received, THE Payment_System SHALL flag the account and send email
15. THE Payment_System SHALL save Stripe customer ID to the user record
16. THE Payment_System SHALL save Stripe subscription ID to the user record
17. THE Payment_System SHALL verify webhook signatures before processing events
18. THE Payment_System SHALL block PDF generation for users without active entitlement
19. THE Payment_System SHALL not expose Stripe secret key to client-side code
20. THE Payment_System SHALL support both test mode and live mode

### Requirement 15: Email Delivery

**User Story:** As a user, I want to email my appraisal report, so that I can send it directly to my insurance company or attorney.

#### Acceptance Criteria

1. THE Email_System SHALL integrate with SendGrid for email delivery
2. THE Email_System SHALL send report delivery emails with PDF download links
3. THE Email_System SHALL send welcome emails when users create accounts
4. THE Email_System SHALL send payment confirmation emails after successful checkout
5. THE Email_System SHALL send subscription renewal reminder emails 3 days before renewal
6. THE Email_System SHALL use HTML email templates
7. THE Email_System SHALL include vehicle information and DV amount in report emails
8. THE Email_System SHALL include signed Vercel Blob URLs for PDF access
9. THE Email_System SHALL send emails from reports@claimshield-dv.com
10. THE Email_System SHALL not attach PDFs directly to emails due to file size
11. THE Email_System SHALL validate user ownership before sending report emails
12. THE Email_System SHALL not expose SendGrid API key to client-side code

### Requirement 16: Dashboard and Appraisal Management

**User Story:** As a user, I want to view and manage all my appraisals in one place, so that I can track my work and access reports.

#### Acceptance Criteria

1. THE Platform SHALL display a dashboard listing all user appraisals
2. THE Platform SHALL display appraisal status: draft, complete, sent
3. THE Platform SHALL display vehicle information for each appraisal
4. THE Platform SHALL display DV amount for completed appraisals
5. THE Platform SHALL display creation date and last updated date
6. THE Platform SHALL provide a duplicate action to clone appraisals
7. WHEN a user duplicates an appraisal, THE Platform SHALL copy all data into a new draft appraisal
8. THE Platform SHALL provide an archive action to soft delete appraisals
9. WHEN a user archives an appraisal, THE Platform SHALL set status to archived and hide from default view
10. THE Platform SHALL provide a bulk download action for multiple appraisals
11. WHEN a user selects multiple appraisals for bulk download, THE Platform SHALL create a ZIP file of PDFs
12. THE Platform SHALL provide a share action to generate expiring URLs
13. WHEN a user shares an appraisal, THE Platform SHALL generate a 7-day expiring signed URL
14. THE Platform SHALL display usage tracking for subscription users
15. THE Platform SHALL display reports used this month
16. THE Platform SHALL display reports remaining for per-report purchasers
17. THE Platform SHALL provide a "Buy More" call-to-action for users without entitlement
18. THE Platform SHALL filter appraisals by status
19. THE Platform SHALL sort appraisals by date
20. THE Platform SHALL provide search functionality for appraisals

### Requirement 17: Document Library

**User Story:** As a user, I want to view all documents attached to an appraisal, so that I can manage uploaded files.

#### Acceptance Criteria

1. THE Platform SHALL display a documents tab within each appraisal detail view
2. THE Platform SHALL list all uploaded files with type, name, size, and upload date
3. THE Platform SHALL provide a preview button for PDF files
4. WHEN a user clicks preview for a PDF, THE Platform SHALL open the PDF in a new tab
5. THE Platform SHALL provide a preview button for image files
6. WHEN a user clicks preview for an image, THE Platform SHALL display the image inline
7. THE Platform SHALL provide a download button for each file
8. WHEN a user clicks download, THE Platform SHALL generate a signed Vercel Blob URL
9. THE Platform SHALL provide a delete button for each file
10. WHEN a user deletes a file, THE Platform SHALL remove it from Blob storage and nullify the database reference
11. THE Platform SHALL allow users to upload additional documents after appraisal creation
12. THE Platform SHALL organize files by type: repair estimates, damage photos, repair photos, insurance documents

### Requirement 18: Role-Based Features

**User Story:** As a professional appraiser, I want access to USPAP certification features, so that my reports meet professional standards.

#### Acceptance Criteria

1. WHEN a user has the appraiser role, THE Platform SHALL display USPAP certification fields
2. WHEN a user has the appraiser role, THE Platform SHALL include USPAP compliance statements in reports
3. WHEN a user has the appraiser role, THE Platform SHALL allow signature upload
4. WHEN a user has the appraiser role, THE Platform SHALL generate expert witness affidavits
5. WHEN a user has the attorney role, THE Platform SHALL allow team management
6. WHEN a user has the attorney role, THE Platform SHALL allow adding paralegal accounts
7. WHEN a user has the body_shop role, THE Platform SHALL display white-label options
8. WHEN a user has the individual role, THE Platform SHALL not display professional-only features
9. THE Platform SHALL enforce role permissions on all API routes
10. WHEN a user attempts to access a feature without required role, THE Platform SHALL return 403 Forbidden

### Requirement 19: Onboarding and Role Selection

**User Story:** As a new user, I want to select my role during onboarding, so that the platform is customized for my needs.

#### Acceptance Criteria

1. WHEN a user completes first authentication, THE Platform SHALL redirect to role selection page
2. THE Platform SHALL present 4 role options: individual, appraiser, attorney, body shop
3. THE Platform SHALL display descriptions for each role option
4. WHEN a user selects a role, THE Platform SHALL save the selection to the database
5. THE Platform SHALL redirect to the dashboard after role selection
6. THE Platform SHALL trigger a Clerk webhook on first login
7. THE Platform SHALL create a user record in the database on first login

### Requirement 20: State Law Warning Banners

**User Story:** As a user, I want to see information about my state's DV laws, so that I understand my legal position.

#### Acceptance Criteria

1. WHEN a user enters Georgia as their state, THE Platform SHALL display a green banner stating "Great news! Georgia has strong DV laws. Your claim is well-supported."
2. WHEN a user enters North Carolina as their state, THE Platform SHALL display a blue banner stating "North Carolina has a formal appraisal dispute process."
3. WHEN a user enters a state other than Georgia or North Carolina, THE Platform SHALL display an amber banner stating "Your state uses general tort law for DV claims. Our report is still fully valid."
4. THE Platform SHALL display state law banners on Step 1 of the wizard after state is entered
5. THE Platform SHALL update the banner when the user changes their state

### Requirement 21: Data Validation and Error Handling

**User Story:** As a user, I want clear error messages when I enter invalid data, so that I can correct mistakes easily.

#### Acceptance Criteria

1. THE Platform SHALL validate VIN format as exactly 17 alphanumeric characters
2. THE Platform SHALL validate email addresses using standard email format
3. THE Platform SHALL validate phone numbers in (XXX) XXX-XXXX format
4. THE Platform SHALL validate dates in ISO format (YYYY-MM-DD)
5. THE Platform SHALL validate that accident date is not in the future
6. THE Platform SHALL validate that mileage is a positive number
7. THE Platform SHALL validate that repair cost is a positive number
8. THE Platform SHALL validate that labor hours are positive numbers
9. THE Platform SHALL display inline validation errors next to invalid fields
10. THE Platform SHALL prevent form submission when required fields are missing
11. THE Platform SHALL display clear error messages for API failures
12. THE Platform SHALL display retry options for failed operations
13. THE Platform SHALL log errors to error tracking system
14. THE Platform SHALL handle network timeouts gracefully
15. THE Platform SHALL display user-friendly error messages, not technical stack traces

### Requirement 22: Performance Requirements

**User Story:** As a user, I want the platform to respond quickly, so that I can complete my appraisal efficiently.

#### Acceptance Criteria

1. THE Platform SHALL transition between wizard steps in less than 200 milliseconds
2. THE Scraping_System SHALL display comparable vehicle results within 15 seconds
3. THE Report_Generator SHALL complete PDF generation within 45 seconds
4. THE AI_Extraction_Engine SHALL complete document extraction within 10 seconds per document
5. THE Platform SHALL load the dashboard in less than 1 second
6. THE Platform SHALL display loading indicators for operations exceeding 1 second
7. THE Platform SHALL auto-save draft data without blocking user interaction
8. THE Platform SHALL optimize database queries to minimize response time
9. THE Platform SHALL use indexes on frequently queried database fields
10. THE Platform SHALL cache static assets for faster page loads

### Requirement 23: Security Requirements

**User Story:** As a user, I want my data to be secure, so that my personal information and appraisals are protected.

#### Acceptance Criteria

1. THE Platform SHALL check Clerk authentication on all API routes before executing
2. THE Platform SHALL validate user ownership on all database queries for appraisals
3. THE Storage_System SHALL enforce private access for all Blob storage URLs
4. THE Platform SHALL not expose Gemini API key in client-side code
5. THE Platform SHALL not expose Stripe secret key in client-side code
6. THE Platform SHALL not expose SendGrid API key in client-side code
7. THE Platform SHALL not expose Apify API token in client-side code
8. THE Platform SHALL not expose database connection string in client-side code
9. THE Payment_System SHALL validate Stripe webhook signatures before processing
10. THE Platform SHALL use HTTPS for all communications
11. THE Platform SHALL sanitize user input to prevent SQL injection
12. THE Platform SHALL use Drizzle ORM for all database queries to prevent raw SQL injection
13. THE Platform SHALL validate and sanitize file uploads to prevent malicious files
14. THE Platform SHALL implement rate limiting on API routes
15. THE Platform SHALL log security events for audit purposes

### Requirement 24: Database Schema and Data Persistence

**User Story:** As a developer, I want a well-structured database schema, so that data is stored consistently and efficiently.

#### Acceptance Criteria

1. THE Platform SHALL use Neon PostgreSQL for database storage
2. THE Platform SHALL use Drizzle ORM for type-safe database access
3. THE Platform SHALL store appraisals with fields: id, user_id, claim_number, appraisal_date, accident_date, purpose, status, owner_info, insurance_info, subject_vehicle, accident_details, valuation_results, severity_analysis, appraiser_info, repair_estimate_url, damage_photos, repair_photos, report_pdf_url, created_at, updated_at
4. THE Platform SHALL store comparable vehicles with fields: id, appraisal_id, comp_type, source, vin, year, make, model, trim, mileage, accident_history, listing_url, listing_price, dealer_name, dealer_phone, location_city, location_state, distance_miles, adjustments, adjusted_value, included_in_calculation, created_at
5. THE Platform SHALL use JSONB fields for complex nested structures
6. THE Platform SHALL use UUID for primary keys
7. THE Platform SHALL create foreign key relationships between appraisals and comparable vehicles
8. THE Platform SHALL cascade delete comparable vehicles when appraisals are deleted
9. THE Platform SHALL create indexes on user_id for appraisals
10. THE Platform SHALL create indexes on appraisal_id for comparable vehicles
11. THE Platform SHALL create indexes on status for appraisals
12. THE Platform SHALL store timestamps for created_at and updated_at
13. THE Platform SHALL update updated_at timestamp on every record modification

### Requirement 25: Repair Estimate Line-Item Extraction

**User Story:** As a user, I want the system to extract every line item from my repair estimate, so that I don't have to manually enter repair details.

#### Acceptance Criteria

1. WHEN a user uploads a repair estimate PDF, THE AI_Extraction_Engine SHALL extract all line items
2. THE AI_Extraction_Engine SHALL extract repair facility name and phone number
3. THE AI_Extraction_Engine SHALL extract estimate date
4. THE AI_Extraction_Engine SHALL extract total parts cost, labor cost, paint cost, and total repair cost
5. THE AI_Extraction_Engine SHALL extract body labor hours, frame labor hours, refinish labor hours, and mechanical labor hours
6. THE AI_Extraction_Engine SHALL calculate total labor hours as the sum of all labor categories
7. THE AI_Extraction_Engine SHALL identify frame pulling operations from line items
8. THE AI_Extraction_Engine SHALL identify alignment requirements from line items
9. THE AI_Extraction_Engine SHALL identify airbag deployment from line items
10. THE AI_Extraction_Engine SHALL identify structural damage from line items
11. THE AI_Extraction_Engine SHALL categorize each line item as OEM, aftermarket, refurbished, labor, paint, or other
12. THE AI_Extraction_Engine SHALL identify labor type for each labor line item: body, frame, refinish, or mechanical
13. THE AI_Extraction_Engine SHALL extract part cost, labor cost, and line total for each item
14. THE AI_Extraction_Engine SHALL identify panel names from line item descriptions
15. THE AI_Extraction_Engine SHALL determine if panels are structural or cosmetic
16. THE AI_Extraction_Engine SHALL create a list of painted panels
17. THE AI_Extraction_Engine SHALL determine if OEM parts were used
18. THE AI_Extraction_Engine SHALL determine if aftermarket parts were used
19. THE AI_Extraction_Engine SHALL determine if refurbished parts were used
20. THE AI_Extraction_Engine SHALL populate Step 3 (Accident Details) fields with extracted data

### Requirement 26: Before and After Image Analysis

**User Story:** As a user, I want the system to analyze my damage photos, so that it can identify damaged components automatically.

#### Acceptance Criteria

1. WHEN a user uploads before and after photos, THE AI_Extraction_Engine SHALL compare the images
2. THE AI_Extraction_Engine SHALL identify structural deformation visibility
3. THE AI_Extraction_Engine SHALL identify suspected frame damage
4. THE AI_Extraction_Engine SHALL identify visible airbag deployment
5. THE AI_Extraction_Engine SHALL identify damaged panels
6. THE AI_Extraction_Engine SHALL classify damage scope as minor, moderate, major, or severe
7. THE AI_Extraction_Engine SHALL assess before-condition as excellent, good, average, or below average
8. THE AI_Extraction_Engine SHALL assess paint condition from before photos
9. THE AI_Extraction_Engine SHALL assess body condition from before photos
10. THE AI_Extraction_Engine SHALL identify point of impact from after photos
11. THE AI_Extraction_Engine SHALL identify damaged areas from after photos
12. THE AI_Extraction_Engine SHALL estimate repair complexity
13. THE AI_Extraction_Engine SHALL identify structural concerns
14. THE AI_Extraction_Engine SHALL generate a 2-3 sentence professional description
15. THE AI_Extraction_Engine SHALL include confidence scores for image analysis
16. THE AI_Extraction_Engine SHALL pre-populate point_of_impact field with analysis results
17. THE AI_Extraction_Engine SHALL pre-populate structural_damage boolean with analysis results
18. THE AI_Extraction_Engine SHALL suggest panels_replaced array entries for user confirmation

### Requirement 27: Educational Resources and Negotiation Guidance

**User Story:** As a user, I want access to negotiation strategies, so that I can effectively communicate with my insurance company.

#### Acceptance Criteria

1. THE Platform SHALL provide educational content about diminished value
2. THE Platform SHALL provide negotiation strategies for insurance claims
3. THE Platform SHALL provide state-specific legal guidance
4. THE Platform SHALL provide sample negotiation scripts
5. THE Platform SHALL provide information about the 17c formula and why it's flawed
6. THE Platform SHALL provide information about NAAA grading standards
7. THE Platform SHALL provide information about the comparable sales method
8. THE Platform SHALL provide information about bad faith insurance practices
9. THE Platform SHALL provide information about when to hire an attorney
10. THE Platform SHALL organize educational content by topic

### Requirement 28: Responsive Design and Mobile Support

**User Story:** As a user, I want to use the platform on my phone or tablet, so that I can work on appraisals from anywhere.

#### Acceptance Criteria

1. THE Platform SHALL be responsive for viewport widths from 320px to 2560px
2. THE Appraisal_Wizard SHALL display properly on mobile devices
3. THE Platform SHALL use touch-friendly controls on mobile devices
4. THE Platform SHALL optimize form layouts for mobile screens
5. THE Platform SHALL stack form fields vertically on narrow screens
6. THE Platform SHALL use mobile-optimized file upload controls
7. THE Platform SHALL display tables responsively with horizontal scrolling when necessary
8. THE Platform SHALL use mobile-friendly navigation menus
9. THE Platform SHALL optimize PDF preview for mobile viewing
10. THE Platform SHALL test on iOS Safari, Android Chrome, and desktop browsers

### Requirement 29: Accessibility Compliance

**User Story:** As a user with disabilities, I want the platform to be accessible, so that I can use all features effectively.

#### Acceptance Criteria

1. THE Platform SHALL use semantic HTML elements
2. THE Platform SHALL provide alt text for all images
3. THE Platform SHALL provide labels for all form inputs
4. THE Platform SHALL support keyboard navigation for all interactive elements
5. THE Platform SHALL provide focus indicators for keyboard navigation
6. THE Platform SHALL use sufficient color contrast ratios
7. THE Platform SHALL not rely solely on color to convey information
8. THE Platform SHALL provide ARIA labels for complex components
9. THE Platform SHALL support screen readers
10. THE Platform SHALL provide skip navigation links

### Requirement 30: Environment Configuration

**User Story:** As a developer, I want proper environment configuration, so that the application runs correctly in all environments.

#### Acceptance Criteria

1. THE Platform SHALL require DATABASE_URL environment variable for Neon connection
2. THE Platform SHALL require NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY for Clerk authentication
3. THE Platform SHALL require CLERK_SECRET_KEY for Clerk authentication
4. THE Platform SHALL require GEMINI_API_KEY for AI document analysis
5. THE Platform SHALL require BLOB_READ_WRITE_TOKEN for Vercel Blob storage
6. THE Platform SHALL require APIFY_API_TOKEN for web scraping
7. THE Platform SHALL require STRIPE_SECRET_KEY for payment processing
8. THE Platform SHALL require NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY for payment processing
9. THE Platform SHALL require STRIPE_WEBHOOK_SECRET for webhook validation
10. THE Platform SHALL require SENDGRID_API_KEY for email delivery
11. THE Platform SHALL require NEXT_PUBLIC_APP_URL for application URL
12. THE Platform SHALL validate that all required environment variables are present on startup
13. THE Platform SHALL fail gracefully with clear error messages if environment variables are missing
14. THE Platform SHALL not commit environment variables to version control
15. THE Platform SHALL use different environment variables for development, staging, and production
