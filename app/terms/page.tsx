import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Warsha+ Qatar",
  description: "Warsha+ platform terms of service for buyers and sellers in Qatar.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-[18px] font-black text-white mb-3">{title}</h2>
    <div className="text-[14px] text-gray-400 leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-dark-primary py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[30px] font-black text-white mb-2">Terms of Service</h1>
          <p className="text-gray-500 text-[13px]">Effective date: January 1, 2025 · Last updated: May 2025</p>
        </div>

        <div className="card p-8 space-y-2">
          <Section title="1. Acceptance of Terms">
            <p>By accessing or using Warsha+ (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service and all applicable laws and regulations of the State of Qatar. If you do not agree with any of these terms, you are prohibited from using this Platform.</p>
          </Section>

          <Section title="2. Platform Description">
            <p>Warsha+ is an online marketplace connecting buyers and sellers of automotive parts, services, and vehicles in Qatar. We act as an intermediary platform only and are not a party to any transaction between users.</p>
          </Section>

          <Section title="3. User Accounts">
            <p>You must provide accurate, current, and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.</p>
            <p>You must be at least 18 years of age to use this Platform. By using the Platform, you represent that you are 18 or older.</p>
            <p>One person may not maintain more than one active account. Accounts are non-transferable.</p>
          </Section>

          <Section title="4. Seller Responsibilities">
            <p>Sellers are solely responsible for the accuracy, legality, and completeness of their listings. All listed items must be owned by the seller and free from legal encumbrances.</p>
            <p>Sellers must comply with all applicable Qatar laws, including the Consumer Protection Law (Law No. 8 of 2008) and Qatar Commercial Law.</p>
            <p>Sellers must not list:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
              <li>Stolen, counterfeit, or illegally obtained items</li>
              <li>Items prohibited under Qatari law</li>
              <li>Unroadworthy vehicles without clear disclosure</li>
              <li>Items that infringe intellectual property rights</li>
            </ul>
          </Section>

          <Section title="5. Buyer Responsibilities">
            <p>Buyers are responsible for conducting their own due diligence before completing any transaction. Warsha+ does not guarantee the condition, authenticity, or title of any item listed.</p>
            <p>Buyers should inspect items before purchase when possible. Warsha+ strongly recommends in-person verification for vehicle purchases.</p>
          </Section>

          <Section title="6. Prohibited Activities">
            <p>Users must not engage in:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
              <li>Fraud, misrepresentation, or deceptive practices</li>
              <li>Spamming, unsolicited commercial communications</li>
              <li>Harassment, threats, or abusive behaviour toward other users</li>
              <li>Circumventing platform fees or payment systems</li>
              <li>Creating fake reviews or ratings</li>
              <li>Scraping or automated data extraction</li>
            </ul>
          </Section>

          <Section title="7. Payments and Transactions">
            <p>Warsha+ facilitates listings but does not process payments directly between buyers and sellers unless a specific payment service is offered. Users transact at their own risk.</p>
            <p>Cash on Delivery (COD) arrangements are agreements solely between buyers and sellers. Warsha+ bears no liability for failed or disputed COD transactions.</p>
          </Section>

          <Section title="8. Content and Intellectual Property">
            <p>Users retain ownership of content they submit. By submitting content, you grant Warsha+ a worldwide, non-exclusive, royalty-free licence to use, display, and distribute that content for platform operation purposes.</p>
            <p>Warsha+&apos;s name, logo, and all platform materials are owned by Warsha+ and may not be used without written permission.</p>
          </Section>

          <Section title="9. Privacy">
            <p>Your use of the Platform is also governed by our <a href="/privacy" className="text-brand-orange hover:underline">Privacy Policy</a>, which is incorporated into these Terms by reference.</p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>To the maximum extent permitted by Qatari law, Warsha+ shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform or any transactions conducted through it.</p>
          </Section>

          <Section title="11. Termination">
            <p>Warsha+ reserves the right to suspend or terminate any account at its sole discretion, including for violations of these Terms, without prior notice.</p>
          </Section>

          <Section title="12. Governing Law">
            <p>These Terms are governed by the laws of the State of Qatar. Any disputes shall be subject to the exclusive jurisdiction of the Qatari courts.</p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>Warsha+ may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms. We will notify registered users of material changes by email.</p>
          </Section>

          <Section title="14. Contact">
            <p>For questions about these Terms, contact us at: <a href="mailto:legal@warsha.plus" className="text-brand-orange hover:underline">legal@warsha.plus</a></p>
          </Section>
        </div>
      </div>
    </div>
  );
}
