export default function Privacy() {
  return (
    <div className="glass-card rounded-2xl p-8 md:p-12">
      <div className="mb-12 border-b border-white/10 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gradient inline-block">Privacy Policy</h1>
        <p className="text-muted-foreground">Last Updated: June 2026</p>
      </div>

      <div className="prose prose-invert prose-indigo max-w-none">
        <p className="text-lg text-foreground/90 lead">
          Welcome to SkillSee.<br />
          SkillSee respects your privacy and is committed to protecting your personal information.
        </p>

        <h3 className="text-2xl font-semibold mt-10 mb-4 text-white">Information We Collect:</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li>Account information (name, email)</li>
          <li>Saved links and content</li>
          <li>Categories and notes</li>
          <li>App usage analytics</li>
          <li>Device information</li>
        </ul>

        <h3 className="text-2xl font-semibold mt-10 mb-4 text-white">How We Use Information:</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li>Provide and improve SkillSee</li>
          <li>Synchronize saved content</li>
          <li>Personalize user experience</li>
          <li>Maintain security</li>
          <li>Provide support</li>
        </ul>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-2 text-white">Data Storage</h3>
            <p className="text-sm text-muted-foreground m-0">Your data may be stored securely on our servers.</p>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-2 text-white">Children's Privacy</h3>
            <p className="text-sm text-muted-foreground m-0">SkillSee is not intended for children under 13.</p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mt-10 mb-4 text-white">Third-Party Services:</h3>
        <p className="text-muted-foreground">
          Authentication providers, Analytics providers, Payment processors, Cloud storage providers
        </p>

        <h3 className="text-2xl font-semibold mt-10 mb-4 text-white">User Rights:</h3>
        <p className="text-muted-foreground">
          Edit account information, Delete saved content, Request account deletion, Export available data
        </p>

        <h3 className="text-2xl font-semibold mt-10 mb-4 text-white">Changes:</h3>
        <p className="text-muted-foreground">
          This policy may be updated periodically.
        </p>

        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-xl font-semibold mb-2 text-white">Contact:</h3>
          <p className="text-primary font-medium">support@skillsee.com</p>
        </div>
      </div>
    </div>
  );
}
