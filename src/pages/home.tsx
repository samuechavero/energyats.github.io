import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Download, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "../supabaseClient";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Phone number is required"),
  email: z.string().email("Invalid email address"),
});

async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

declare global {
  interface Window {
    fbq: any;
  }
}

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isUnlocked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isUnlocked]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('energy_ats_leads')
        .insert([
          { 
            full_name: values.name, 
            email: values.email, 
            phone: values.phone 
          }
        ]);
        
      if (error) {
        console.error('Error inserting lead:', error);
        alert("Error submitting the form, please try again.");
      } else {
        // Meta Pixel - Advanced Matching & Lead Event
        try {
          const emRaw = values.email.trim().toLowerCase();
          const emHashed = await sha256(emRaw);
          
          const nameParts = values.name.trim().toLowerCase().split(' ');
          const fn = nameParts[0] || '';
          const ln = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          
          if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('init', '1454090999596042', {
              em: emHashed,
              fn: fn,
              ln: ln,
              external_id: emHashed
            });
            window.fbq('track', 'Lead');
          }
        } catch (pixelErr) {
          console.error("Error firing pixel:", pixelErr);
        }

        setIsUnlocked(true);
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert("Error submitting the form, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-[100dvh] w-full relative flex items-center justify-center bg-slate-950 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-multiply"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 z-10 bg-slate-900/60" />

        {/* Content */}
        <div className="relative z-20 w-full max-w-md px-4">
          <Card className="border-none shadow-2xl rounded-none">
            <div className="h-1.5 w-full bg-[#EA580C]" />
            <CardContent className="pt-5 pb-5 px-6 bg-white">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded-full">
                  <Lock className="text-slate-400 w-5 h-5" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-slate-900 text-center mb-1.5 leading-tight uppercase font-serif tracking-tight">
                Congratulations on Taking Your First Step to Reduce NPT.
              </h1>
              <p className="text-slate-500 text-center mb-4 text-sm">
                Exclusive access for oilfield operators and industry professionals.
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-900 font-bold uppercase text-xs tracking-wider">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="h-9 rounded-none border-slate-300 focus-visible:ring-[#EA580C]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-900 font-bold uppercase text-xs tracking-wider">Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" className="h-9 rounded-none border-slate-300 focus-visible:ring-[#EA580C]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-900 font-bold uppercase text-xs tracking-wider">Work Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@company.com" className="h-9 rounded-none border-slate-300 focus-visible:ring-[#EA580C]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-11 text-base bg-[#EA580C] hover:bg-[#C24100] text-white rounded-none uppercase font-bold tracking-widest transition-colors shadow-none"
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        Access & Download
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-50 bg-[#0F172A] border-b border-slate-800">
        <div className="container mx-auto px-6 h-20 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#EA580C]" />
            <span className="text-white font-serif text-2xl font-bold tracking-wider uppercase">Energy ATS Houston</span>
          </div>
        </div>
      </header>

      {/* 2. HERO BANNER */}
      <section className="relative min-h-[80vh] flex items-center bg-[#0F172A]">
        <div 
          className="absolute inset-0 z-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container relative z-10 mx-auto px-6 py-24">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white uppercase leading-[0.95] tracking-tight mb-8">
              Built Tight.<br />
              Tested <span className="text-[#EA580C]">Right.</span><br />
              Delivered Fast.
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-2xl border-l-4 border-[#EA580C] pl-6 py-2">
              Texas-Based Oilfield Tool Assembly & Pressure Testing. 
              Over 30 years of zero-compromise precision.
            </p>
          </div>
        </div>
      </section>

      {/* 3. LEAD MAGNET DOWNLOAD SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Visual Mockup */}
            <div className="relative mx-auto w-full max-w-md aspect-[3/4] bg-[#0F172A] shadow-2xl p-8 flex flex-col justify-between border-l-8 border-[#EA580C]">
              <div>
                <div className="w-12 h-12 bg-[#EA580C] mb-8" />
                <h3 className="text-white font-serif text-4xl font-bold uppercase leading-none tracking-tight mb-4">
                  The 48-Hour<br />Turnaround<br />Blueprint
                </h3>
                <div className="w-16 h-1 bg-slate-700 mb-4" />
                <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Technical Guide V.1</p>
              </div>
              <div className="border-t border-slate-800 pt-6 flex justify-between items-end">
                <p className="text-slate-500 text-xs font-mono">ENERGY ATS DOC: 001</p>
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-slate-600"></div>
                  <div className="w-1 h-4 bg-slate-600"></div>
                  <div className="w-1 h-4 bg-slate-600"></div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div>
              <h2 className="text-4xl font-serif font-bold text-slate-900 uppercase mb-6 tracking-tight">
                Your technical guide is ready.
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Inside this blueprint, you'll discover our exact protocols for achieving 24-48 hour rush turnarounds, reducing Non-Productive Time (NPT), and our stringent full-traceability documentation standards.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "Fast turnaround assembly secrets",
                  "NPT reduction strategies",
                  "100% Traceability & documentation protocols"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="bg-[#EA580C]/10 p-1 rounded-full">
                      <Check className="w-5 h-5 text-[#EA580C]" />
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="./the-48-hour-turnaround-blueprint.pdf"
                download
                className="w-full sm:w-auto text-xl py-8 px-12 bg-[#EA580C] hover:bg-[#C24100] text-white rounded-none uppercase font-bold tracking-widest transition-colors shadow-none flex items-center justify-center gap-3"
              >
                <Download className="w-6 h-6" />
                Download Blueprint PDF
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR SERVICES */}
      <section className="py-24 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-sm font-bold text-[#EA580C] tracking-[0.2em] uppercase mb-2">Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-white uppercase tracking-tight">Our Services</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Completion Tools",
              "Liner Hangers",
              "Packer & Seal Assemblies",
              "Float Equipment",
              "Redress & Repair",
              "Break Out / Make Up Services"
            ].map((service, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 p-8 flex items-start gap-4 transition-colors hover:bg-slate-800">
                <div className="bg-[#EA580C] p-2 mt-1">
                  <Check className="w-5 h-5 text-white stroke-[3]" />
                </div>
                <h4 className="text-xl font-bold text-white uppercase tracking-wide">{service}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. OUR SYSTEMS */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-sm font-bold text-[#EA580C] tracking-[0.2em] uppercase mb-2">Infrastructure</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 uppercase tracking-tight">Heavy-Duty Systems</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-white shadow-xl border border-slate-200">
              <div className="p-8 border-t-4 border-[#EA580C]">
                <h4 className="text-2xl font-serif font-bold text-slate-900 uppercase tracking-tight mb-2">Quickturn Assembly</h4>
                <p className="text-slate-600 font-medium">Heavy-duty, calibrated vises</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-white shadow-xl border border-slate-200">
              <div className="p-8 border-t-4 border-[#EA580C]">
                <h4 className="text-2xl font-serif font-bold text-slate-900 uppercase tracking-tight mb-2">Torque Machine</h4>
                <p className="text-slate-600 font-medium">19ft long, 60,000 FT.LBS max torque</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white shadow-xl border border-slate-200">
              <div className="p-8 border-t-4 border-[#EA580C]">
                <h4 className="text-2xl font-serif font-bold text-slate-900 uppercase tracking-tight mb-2">Pressure Testing</h4>
                <p className="text-slate-600 font-medium">15,000 PSI hydrostatic capacity</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. THE TEXAS ADVANTAGE */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/3">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 uppercase tracking-tight">
                The Texas<br />
                <span className="text-[#EA580C] border-b-4 border-[#EA580C]">Advantage</span>
              </h2>
            </div>
            
            <div className="md:w-2/3 w-full">
              <ul className="space-y-6">
                {[
                  "24-48 HRS Rush Order Turnaround",
                  "Max 2 Week Lead Time on All Orders",
                  "100% Full Traceability & Documentation"
                ].map((point, i) => (
                  <li key={i} className="flex items-center gap-6 bg-slate-50 p-6 border border-slate-100">
                    <div className="shrink-0 w-12 h-12 bg-[#EA580C] flex items-center justify-center">
                      <Check className="w-6 h-6 text-white stroke-[3]" />
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-slate-800 uppercase tracking-tight">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#0F172A] py-16 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <div className="w-12 h-12 bg-[#EA580C] mx-auto mb-8" />
          <h4 className="text-2xl text-white font-serif uppercase tracking-widest mb-12">
            Over 30 Years Of Assembly & Testing Experience.
          </h4>
          <div className="w-full h-px bg-slate-800 mb-8" />
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
            © 2026 Energy Assembly & Testing Services
          </p>
        </div>
      </footer>
    </div>
  );
}