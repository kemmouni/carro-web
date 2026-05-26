import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Warsha+ Qatar",
  description: "How Warsha+ collects, uses, and protects your personal data.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-[18px] font-black text-white mb-3">{title}</h2>
    <div className="text-[14px] text-gray-400 leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark-primary py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[30px] font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-[13px]">Effective date: January 1, 2025 · Last updated: May 2025</p>
        </div>

        <div className="card p-8 space-y-2">
          <Section title="1. Introduction">
            <p>Warsha+ (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your personal data in accordance with Qatar&apos;s Personal Data Privacy Protection Law (Law No. 13 of 2016) and applicable regulations.</p>
            <p>This Privacy Policy explains what data we collect, how we use it, and your rights regarding your personal information.</p>
          </Section>

          <Section title="2. Data We Collect">
            <p><strong className="text-white">Account data:</strong> Name, email address, phone number, password (hashed), and profile photo when you register.</p>
            <p><strong className="text-white">Store data:</strong> Business name, store description, city, working hours, and store images for sellers.</p>
            <p><strong className="text-white">Listing data:</strong> Product information, photos, pricing, and vehicle details you publish.</p>
            <p><strong className="text-white">Transaction data:</strong> Order details, delivery addresses, and payment method preferences (COD).</p>
            <p><strong className="text-white">Communication data:</strong> Messages exchanged between buyers and sellers through the platform.</p>
            <p><strong className="text-white">Usage data:</strong> Pages visited, search queries, listing views, and device information (browser type, IP address).</p>
          </Section>

          <Section title="3. How We Use Your Data">
            <ul className="list-disc pl-5 space-y-1">
              <li>To create and maintain your account</li>
              <li>To display your listings to potential buyers</li>
              <li>To facilitate communication between buyers and sellers</li>
              <li>To process orders and send order notifications</li>
              <li>To send service-related emails (account verification, password reset)</li>
              <li>To improve platform features and user experience</li>
              <li>To comply with legal obligations under Qatari law</li>
            </ul>
          </Section>

          <Section title="4. Data Sharing">
            <p>We do not sell your personal data. We may share data with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Other users:</strong> Your store name, city, phone, and listings are visible to other platform users as part of normal marketplace operation.</li>
              <li><strong className="text-white">Service providers:</strong> Cloud hosting (Supabase/AWS), image storage, and analytics tools under data processing agreements.</li>
              <li><strong className="text-white">Legal authorities:</strong> When required by Qatari law or lawful order.</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p>We retain your account data for as long as your account is active. Deleted accounts are anonymised within 90 days. Order records are retained for 7 years as required by Qatari commercial law.</p>
          </Section>

          <Section title="6. Your Rights">
            <p>Under Qatar&apos;s data protection law, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access your personal data held by us</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Object to processing of your data for marketing purposes</li>
              <li>Request a copy of your data in a portable format</li>
            </ul>
            <p>To exercise these rights, contact: <a href="mailto:privacy@warsha.plus" className="text-brand-orange hover:underline">privacy@warsha.plus</a></p>
          </Section>

          <Section title="7. Cookies and Tracking">
            <p>We use essential cookies for session management and authentication. Analytics cookies (if enabled) help us understand how the platform is used. You can disable non-essential cookies in your browser settings.</p>
          </Section>

          <Section title="8. Security">
            <p>We implement industry-standard security measures including encryption in transit (HTTPS/TLS), encrypted password storage, and access controls. However, no system is completely secure and we cannot guarantee absolute security.</p>
          </Section>

          <Section title="9. Children">
            <p>The Platform is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has provided us with personal data, contact us immediately.</p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this Privacy Policy periodically. We will notify registered users by email of material changes at least 14 days before they take effect.</p>
          </Section>

          <Section title="11. Contact">
            <p>Data Controller: Warsha+ Qatar<br />
            Email: <a href="mailto:privacy@warsha.plus" className="text-brand-orange hover:underline">privacy@warsha.plus</a></p>
          </Section>
        </div>
      </div>
    </div>
  );
}
