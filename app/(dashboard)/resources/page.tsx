import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Scale, TrendingUp, AlertTriangle, Users, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Educational Resources | ClaimShield DV',
  description: 'Learn about diminished value claims, negotiation strategies, and state-specific guidance',
};

export default function ResourcesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Educational Resources</h1>
        <p className="text-muted-foreground">
          Learn about diminished value claims, negotiation strategies, and legal considerations
        </p>
      </div>

      <Tabs defaultValue="basics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="basics">DV Basics</TabsTrigger>
          <TabsTrigger value="negotiation">Negotiation</TabsTrigger>
          <TabsTrigger value="state-laws">State Laws</TabsTrigger>
          <TabsTrigger value="methodology">Methodology</TabsTrigger>
          <TabsTrigger value="bad-faith">Bad Faith</TabsTrigger>
          <TabsTrigger value="legal">Legal Help</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>What is Diminished Value?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Diminished value (DV) is the difference between a vehicle's fair market value before an accident
                and its fair market value after repairs have been completed. Even when repairs are performed to
                manufacturer specifications, a vehicle with an accident history is worth less than an identical
                vehicle with no accident history.
              </p>
              <h3>Three Types of Diminished Value</h3>
              <ul>
                <li>
                  <strong>Inherent Diminished Value</strong>: The most common type, representing the loss in value
                  due to the vehicle's accident history, even after proper repairs.
                </li>
                <li>
                  <strong>Repair-Related Diminished Value</strong>: Loss in value due to improper or incomplete
                  repairs.
                </li>
                <li>
                  <strong>Immediate Diminished Value</strong>: The difference between pre-accident value and the
                  value immediately after the accident (before repairs).
                </li>
              </ul>
              <p>
                ClaimShield DV focuses on inherent diminished value, which is the type most commonly recovered in
                insurance claims.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Who Can Claim Diminished Value?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                In most states, you can claim diminished value if:
              </p>
              <ul>
                <li>You were NOT at fault for the accident</li>
                <li>The other party's insurance is responsible for damages</li>
                <li>Your vehicle has been repaired or is repairable</li>
                <li>Your vehicle is relatively new (typically less than 10 years old)</li>
                <li>Your vehicle had low mileage before the accident</li>
              </ul>
              <p className="text-amber-600 font-medium">
                Note: You generally CANNOT claim diminished value from your own insurance company in most states,
                unless you have specific coverage for it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How Much is My Claim Worth?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Diminished value claims typically range from 10% to 25% of the vehicle's pre-accident value,
                depending on:
              </p>
              <ul>
                <li>Severity of damage (structural vs. cosmetic)</li>
                <li>Quality and extent of repairs</li>
                <li>Vehicle age and mileage</li>
                <li>Vehicle make, model, and market demand</li>
                <li>State laws and legal precedents</li>
              </ul>
              <p>
                For example, a $30,000 vehicle with moderate damage might have a diminished value claim of
                $3,000 to $7,500.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negotiation" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Negotiation Strategies</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h3>Step 1: Document Everything</h3>
              <p>Before contacting the insurance company:</p>
              <ul>
                <li>Obtain a professional diminished value appraisal (like ClaimShield DV)</li>
                <li>Gather all repair estimates and invoices</li>
                <li>Take photos of damage before and after repairs</li>
                <li>Collect comparable vehicle listings showing price differences</li>
              </ul>

              <h3>Step 2: Initial Demand</h3>
              <p>When submitting your claim:</p>
              <ul>
                <li>Send a formal demand letter with your appraisal</li>
                <li>Request a specific dollar amount based on your appraisal</li>
                <li>Include all supporting documentation</li>
                <li>Set a reasonable deadline for response (typically 30 days)</li>
              </ul>

              <h3>Step 3: Respond to Lowball Offers</h3>
              <p>Insurance companies often make low initial offers. When this happens:</p>
              <ul>
                <li>Don't accept the first offer</li>
                <li>Request their appraisal methodology in writing</li>
                <li>Point out flaws in their valuation (if using 17c formula, see below)</li>
                <li>Provide additional comparable vehicle evidence</li>
                <li>Counter with a reasonable amount between their offer and your demand</li>
              </ul>

              <h3>Step 4: Escalation</h3>
              <p>If negotiations stall:</p>
              <ul>
                <li>Request to speak with a supervisor or claims manager</li>
                <li>File a complaint with your state's Department of Insurance</li>
                <li>Consider hiring an attorney (especially for claims over $5,000)</li>
                <li>Mention potential bad faith claims if applicable (see Bad Faith tab)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Negotiation Scripts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Initial Contact</h4>
                <div className="bg-muted p-4 rounded-lg text-sm">
                  "I'm calling regarding claim #[CLAIM_NUMBER] for the accident on [DATE]. I've obtained a
                  professional diminished value appraisal showing my vehicle has lost $[AMOUNT] in value due to
                  the accident. I'm submitting this appraisal along with supporting documentation and requesting
                  payment of this amount within 30 days."
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Responding to Lowball Offer</h4>
                <div className="bg-muted p-4 rounded-lg text-sm">
                  "Thank you for your offer of $[LOW_AMOUNT]. However, this is significantly below the actual
                  diminished value as determined by a professional appraisal using the comparable sales method.
                  Can you provide your appraisal methodology in writing? I'd like to understand how you arrived
                  at this figure. My appraisal is based on actual market data showing [X] comparable vehicles,
                  and I believe $[COUNTER_AMOUNT] is a fair settlement."
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Escalation Request</h4>
                <div className="bg-muted p-4 rounded-lg text-sm">
                  "I've been negotiating this claim for [X] weeks/months without a fair resolution. I'd like to
                  escalate this to a claims supervisor or manager. Additionally, I'm prepared to file a complaint
                  with the [STATE] Department of Insurance and consult with an attorney if we cannot reach a
                  reasonable settlement. Can you connect me with someone who has authority to settle this claim?"
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="state-laws" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <CardTitle>State-Specific Guidance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Diminished value laws vary significantly by state. Here's guidance for key states:
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Georgia</CardTitle>
              <CardDescription>Strong diminished value protections</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Georgia has some of the strongest diminished value protections in the country, established by
                the landmark case <em>Canal Insurance Co. v. Tullis</em>.
              </p>
              <h4>Key Points:</h4>
              <ul>
                <li>Diminished value is recoverable as part of property damage</li>
                <li>The 17c formula is NOT required and often undervalues claims</li>
                <li>Comparable sales method is preferred by courts</li>
                <li>60-day demand letter can trigger bad faith penalties</li>
                <li>Bad faith penalties can add 50% + attorney fees</li>
              </ul>
              <h4>Relevant Laws:</h4>
              <ul>
                <li>O.C.G.A. § 33-4-6: Bad faith statute</li>
                <li>O.C.G.A. § 33-4-7: Penalty for bad faith refusal</li>
                <li><em>Canal Ins. Co. v. Tullis</em>, 510 S.E.2d 344 (Ga. Ct. App. 1998)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>North Carolina</CardTitle>
              <CardDescription>Diminished value recognized by statute</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                North Carolina explicitly recognizes diminished value in its insurance statutes.
              </p>
              <h4>Key Points:</h4>
              <ul>
                <li>Diminished value is part of property damage under N.C. Gen. Stat. § 20-279.21(d)(1)</li>
                <li>No specific methodology required</li>
                <li>Professional appraisals are recommended</li>
                <li>Unfair claims practices can result in penalties</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Other States</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Most states recognize diminished value claims under general property damage principles,
                following the Restatement of Torts § 928.
              </p>
              <h4>Generally Favorable States:</h4>
              <ul>
                <li>Florida</li>
                <li>Texas</li>
                <li>California</li>
                <li>Virginia</li>
                <li>Tennessee</li>
              </ul>
              <h4>States with Limitations:</h4>
              <ul>
                <li>Michigan (no-fault state, limited DV recovery)</li>
                <li>New York (difficult to recover from own insurer)</li>
              </ul>
              <p className="text-amber-600">
                Always check your specific state's laws or consult with a local attorney for state-specific
                guidance.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methodology" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Valuation Methodologies</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                There are several methods for calculating diminished value. Understanding these helps you
                evaluate offers and negotiate effectively.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparable Sales Method (Recommended)</CardTitle>
              <CardDescription>Used by ClaimShield DV</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                The comparable sales method is the most accurate and legally defensible approach. It compares
                actual market prices of similar vehicles with and without accident history.
              </p>
              <h4>How It Works:</h4>
              <ol>
                <li>Find comparable vehicles without accident history (pre-accident value)</li>
                <li>Find comparable vehicles with similar accident history (post-repair value)</li>
                <li>Calculate the median price difference</li>
                <li>Apply adjustments for mileage, equipment, age, and condition</li>
              </ol>
              <h4>Advantages:</h4>
              <ul>
                <li>Based on actual market data</li>
                <li>Reflects real-world buyer behavior</li>
                <li>Accepted by courts and appraisers</li>
                <li>Accounts for vehicle-specific factors</li>
              </ul>
              <h4>Key Constants Used:</h4>
              <ul>
                <li>Mileage adjustment: $0.12 per mile difference</li>
                <li>Equipment adjustment: 80% of MSRP value</li>
                <li>Year adjustment: 7% annual depreciation (vehicles under 5 years)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>17c Formula (Not Recommended)</CardTitle>
              <CardDescription className="text-destructive">Often undervalues claims</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                The 17c formula was created by an insurance company (Mitchell International) and is often used
                by insurers to minimize payouts. It is NOT required by law in any state.
              </p>
              <h4>How It Works:</h4>
              <p className="font-mono text-sm bg-muted p-2 rounded">
                DV = Base Value × 10% × Damage Multiplier × Mileage Multiplier
              </p>
              <h4>Problems with 17c:</h4>
              <ul>
                <li>Caps diminished value at 10% regardless of actual damage</li>
                <li>Uses arbitrary multipliers not based on market data</li>
                <li>Heavily penalizes higher mileage vehicles</li>
                <li>Doesn't account for structural damage severity</li>
                <li>Created by insurance industry to minimize payouts</li>
              </ul>
              <p className="text-destructive font-medium">
                If an insurance company offers a 17c-based valuation, challenge it and provide a comparable
                sales appraisal instead.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NAAA Grading System</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                The National Auto Auction Association (NAAA) grading system is used to assess vehicle condition
                and is incorporated into ClaimShield DV's severity analysis.
              </p>
              <h4>NAAA Grades:</h4>
              <ul>
                <li><strong>Grade 5 (Excellent)</strong>: Minor cosmetic damage only</li>
                <li><strong>Grade 4 (Good)</strong>: Moderate damage, no structural issues</li>
                <li><strong>Grade 3 (Average)</strong>: Significant damage, possible minor structural</li>
                <li><strong>Grade 2 (Below Average)</strong>: Major damage with structural repairs</li>
                <li><strong>Grade 1 (Rough)</strong>: Severe structural damage</li>
              </ul>
              <p>
                Post-repair NAAA grade affects resale value and is a key factor in diminished value calculations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bad-faith" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Bad Faith Insurance Practices</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Insurance companies have a legal duty to handle claims fairly and in good faith. When they fail
                to do so, you may have additional remedies beyond your original claim.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What is Bad Faith?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Bad faith occurs when an insurance company unreasonably denies, delays, or undervalues a valid
                claim. Examples include:
              </p>
              <ul>
                <li>Refusing to investigate a claim properly</li>
                <li>Denying a claim without reasonable basis</li>
                <li>Failing to respond to communications</li>
                <li>Misrepresenting policy terms or coverage</li>
                <li>Offering unreasonably low settlements</li>
                <li>Delaying payment without justification</li>
                <li>Requiring unnecessary documentation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Georgia Bad Faith Penalties</CardTitle>
              <CardDescription>Strongest bad faith protections in the country</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Georgia law provides significant penalties for bad faith insurance practices, making it one of
                the most consumer-friendly states for insurance claims.
              </p>
              <h4>60-Day Demand Letter</h4>
              <p>
                Under O.C.G.A. § 33-4-6, you can send a demand letter giving the insurance company 60 days to
                pay your claim. If they fail to pay within 60 days without reasonable cause, you may be entitled
                to:
              </p>
              <ul>
                <li>The original claim amount</li>
                <li>50% penalty on the claim amount</li>
                <li>Attorney fees and costs</li>
                <li>Interest from the date of demand</li>
              </ul>
              <h4>Example:</h4>
              <p className="bg-muted p-4 rounded-lg">
                If your diminished value claim is $5,000 and the insurer fails to pay within 60 days of your
                demand letter, you could recover:
                <br />
                <br />
                Original claim: $5,000
                <br />
                50% penalty: $2,500
                <br />
                Attorney fees: $3,000-$5,000
                <br />
                <strong>Total recovery: $10,500-$12,500</strong>
              </p>
              <p className="text-amber-600 font-medium">
                The 60-day demand letter must be properly formatted and include specific language. Use
                ClaimShield DV's Georgia demand letter template to ensure compliance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>When to Consider Bad Faith Action</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Consider pursuing a bad faith claim if:
              </p>
              <ul>
                <li>The insurer has ignored your claim for more than 30 days</li>
                <li>They've denied your claim without providing a reasonable explanation</li>
                <li>They've offered an amount significantly below your professional appraisal</li>
                <li>They've requested the same documentation multiple times</li>
                <li>They've failed to respond to your 60-day demand letter (Georgia)</li>
              </ul>
              <p className="text-primary font-medium">
                Bad faith claims can significantly increase your recovery, but they require careful documentation
                and often legal representation. Consult with an attorney experienced in insurance bad faith.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>When to Hire an Attorney</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                While many diminished value claims can be settled without an attorney, legal representation may
                be beneficial in certain situations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consider Hiring an Attorney If:</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul>
                <li>Your claim is worth more than $5,000</li>
                <li>The insurance company has denied your claim</li>
                <li>Negotiations have stalled for more than 60 days</li>
                <li>You've sent a 60-day demand letter (Georgia) without response</li>
                <li>The insurer is acting in bad faith</li>
                <li>Your vehicle had severe structural damage</li>
                <li>You're uncomfortable negotiating on your own</li>
                <li>The insurer is requesting arbitration or litigation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What to Look for in an Attorney</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                When selecting an attorney for a diminished value claim:
              </p>
              <ul>
                <li>Look for experience with property damage and insurance claims</li>
                <li>Ask about their success rate with DV claims</li>
                <li>Inquire about fee structure (many work on contingency)</li>
                <li>Ensure they're licensed in your state</li>
                <li>Check reviews and references</li>
                <li>Ask if they've handled bad faith cases (if applicable)</li>
              </ul>
              <h4>Typical Fee Structures:</h4>
              <ul>
                <li><strong>Contingency</strong>: 33-40% of recovery (most common)</li>
                <li><strong>Hourly</strong>: $200-$500/hour (less common for DV claims)</li>
                <li><strong>Flat Fee</strong>: Fixed amount for specific services</li>
              </ul>
              <p className="text-primary">
                In Georgia bad faith cases, attorney fees are often recoverable from the insurance company,
                making legal representation more affordable.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>DIY vs. Attorney: Cost-Benefit Analysis</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Handle It Yourself</h4>
                  <p className="text-sm mb-2"><strong>Best for:</strong></p>
                  <ul className="text-sm">
                    <li>Claims under $5,000</li>
                    <li>Cooperative insurance companies</li>
                    <li>Straightforward cases</li>
                  </ul>
                  <p className="text-sm mt-2"><strong>Pros:</strong></p>
                  <ul className="text-sm">
                    <li>Keep 100% of settlement</li>
                    <li>Faster resolution possible</li>
                    <li>Learn valuable skills</li>
                  </ul>
                  <p className="text-sm mt-2"><strong>Cons:</strong></p>
                  <ul className="text-sm">
                    <li>Time-consuming</li>
                    <li>May settle for less</li>
                    <li>Limited leverage</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Hire an Attorney</h4>
                  <p className="text-sm mb-2"><strong>Best for:</strong></p>
                  <ul className="text-sm">
                    <li>Claims over $5,000</li>
                    <li>Denied or delayed claims</li>
                    <li>Bad faith situations</li>
                  </ul>
                  <p className="text-sm mt-2"><strong>Pros:</strong></p>
                  <ul className="text-sm">
                    <li>Professional negotiation</li>
                    <li>Higher settlements often</li>
                    <li>Bad faith penalties</li>
                  </ul>
                  <p className="text-sm mt-2"><strong>Cons:</strong></p>
                  <ul className="text-sm">
                    <li>33-40% contingency fee</li>
                    <li>Longer process</li>
                    <li>Less control</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Free Legal Resources</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul>
                <li>State Bar Association referral services</li>
                <li>Legal aid societies (for low-income individuals)</li>
                <li>State Department of Insurance consumer assistance</li>
                <li>Small claims court (for claims under state limits)</li>
                <li>Law school clinics</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
