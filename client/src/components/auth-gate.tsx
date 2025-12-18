import { motion } from "framer-motion";
import { Lock, Shield, FlaskConical, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

interface AuthGateProps {
  title?: string;
  description?: string;
}

export function AuthGate({ title, description }: AuthGateProps) {
  const { login } = useAuth();

  const defaultTitle = "Researcher Access Required";
  const defaultDescription = "Create a free account to access our premium research compounds and educational resources.";

  const benefits = [
    {
      icon: FlaskConical,
      title: "Premium Research Compounds",
      description: "Access our full catalog of verified peptides"
    },
    {
      icon: Shield,
      title: "Verified Quality",
      description: "View COAs and batch verification data"
    },
    {
      icon: GraduationCap,
      title: "Research Academy",
      description: "Exclusive educational content and courses"
    }
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-sm border-[#E7FB10]/20">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#E7FB10]/10 flex items-center justify-center"
            >
              <Lock className="w-10 h-10 text-[#E7FB10]" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {title || defaultTitle}
            </h1>
            
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {description || defaultDescription}
            </p>
          </div>

          <div className="grid gap-4 mb-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-background/50"
              >
                <div className="w-10 h-10 rounded-full bg-[#21d8ff]/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-[#21d8ff]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => login()}
              className="w-full h-14 text-lg font-semibold bg-[#E7FB10] hover:bg-[#E7FB10]/90 text-black"
              data-testid="button-auth-gate-login"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => login()}
                className="text-[#21d8ff] hover:underline font-medium"
                data-testid="button-auth-gate-signin"
              >
                Sign in
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Instant access</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-red-950/40 border border-red-500/30">
            <p className="text-xs text-red-400 text-center">
              <strong>Research Use Only:</strong> All products are sold exclusively for laboratory and research purposes. 
              By creating an account, you confirm you are 21+ years of age and a qualified researcher.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
