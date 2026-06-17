export default function Terms() {
  return (
    <div className="glass-card rounded-2xl p-8 md:p-12">
      <div className="mb-12 border-b border-white/10 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gradient inline-block">Terms of Service</h1>
        <p className="text-muted-foreground">Last Updated: June 2026</p>
      </div>

      <div className="prose prose-invert prose-indigo max-w-none">
        <p className="text-lg text-foreground/90 lead">
          By using SkillSee, you agree to these Terms of Service.
        </p>

        <h3 className="text-2xl font-semibold mt-10 mb-4 text-white">Service Description:</h3>
        <p className="text-muted-foreground">
          SkillSee helps users save, organize, and manage educational content.
        </p>

        <h3 className="text-2xl font-semibold mt-10 mb-4 text-white">User Accounts:</h3>
        <p className="text-muted-foreground">
          Users are responsible for account security.
        </p>

        <h3 className="text-2xl font-semibold mt-10 mb-4 text-white">Acceptable Use:</h3>
        <p className="text-muted-foreground mb-2">Users may not:</p>
        <ul className="space-y-2 text-muted-foreground">
          <li>Violate laws</li>
          <li>Upload harmful content</li>
          <li>Attempt unauthorized access</li>
          <li>Disrupt services</li>
        </ul>

        <h3 className="text-2xl font-semibold mt-10 mb-4 text-white">User Content:</h3>
        <p className="text-muted-foreground">
          Users retain ownership of their saved content.
        </p>

        <div className="bg-gradient-to-br from-primary/20 to-[#8B5CF6]/20 rounded-xl p-8 border border-primary/20 mt-10 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 blur-[50px] -mr-10 -mt-10 pointer-events-none"></div>
          <h3 className="text-xl font-bold mb-4 text-white mt-0">Premium Subscription</h3>
          <p className="text-muted-foreground mb-4">
            Plans: <strong className="text-white">$1.99/month</strong> or <strong className="text-white">$14.99/year</strong>.
          </p>
          <p className="text-sm text-muted-foreground/80">
            Subscriptions automatically renew unless canceled.
          </p>
        </div>

        <h3 className="text-2xl font-semibold mt-10 mb-4 text-white">Service Availability:</h3>
        <p className="text-muted-foreground">
          SkillSee does not guarantee uninterrupted service.
        </p>

        <h3 className="text-2xl font-semibold mt-10 mb-4 text-white">Limitation of Liability:</h3>
        <p className="text-muted-foreground">
          SkillSee is provided "as is".
        </p>

        <h3 className="text-2xl font-semibold mt-10 mb-4 text-white">Termination:</h3>
        <p className="text-muted-foreground">
          Accounts violating terms may be suspended or terminated.
        </p>

        <h3 className="text-2xl font-semibold mt-10 mb-4 text-white">Changes:</h3>
        <p className="text-muted-foreground">
          Terms may be updated periodically.
        </p>

        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-xl font-semibold mb-2 text-white">Contact:</h3>
          <p className="text-primary font-medium">support@skillsee.com</p>
        </div>
      </div>
    </div>
  );
}
