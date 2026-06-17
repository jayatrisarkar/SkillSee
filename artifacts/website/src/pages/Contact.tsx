import { Mail, Briefcase, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  const cards = [
    {
      title: "Support",
      email: "support@skillsee.com",
      icon: <Mail className="w-6 h-6 text-primary" />,
      delay: 0.1
    },
    {
      title: "Business",
      email: "business@skillsee.com",
      icon: <Briefcase className="w-6 h-6 text-primary" />,
      delay: 0.2
    },
    {
      title: "Feature Requests",
      email: "feedback@skillsee.com",
      icon: <Lightbulb className="w-6 h-6 text-primary" />,
      delay: 0.3
    }
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-gradient inline-block">
          Contact SkillSee
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: card.delay, duration: 0.4 }}
            className="glass-card rounded-2xl p-8 hover:bg-card/80 transition-all hover:-translate-y-1 hover:shadow-primary/20 hover:border-primary/30 flex flex-col items-center text-center group cursor-default"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
              {card.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
            <a 
              href={`mailto:${card.email}`}
              className="text-muted-foreground hover:text-primary transition-colors block p-2"
            >
              {card.email}
            </a>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center glass-card rounded-xl p-6 border-white/5 inline-block mx-auto"
      >
        <p className="text-sm text-muted-foreground m-0 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Response time note: 24–48 hours
        </p>
      </motion.div>
    </div>
  );
}
