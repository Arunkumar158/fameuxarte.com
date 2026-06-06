import MainLayout from "@/components/layouts/MainLayout";
import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Globe, ServerCrash, Cpu, Database, Bug, Paintbrush, Code2 } from "lucide-react";

const OurStory = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <MainLayout>
      <div className="bg-obsidian min-h-screen text-linen pb-20 overflow-hidden font-sans">
        
        {/* Section 1: Hero Founder Section */}
        <section className="container pt-24 pb-16 md:pt-32 md:pb-24">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="flex flex-col md:flex-row justify-center items-stretch gap-8 mb-16 max-w-5xl mx-auto"
          >
            {/* Founder 1 */}
            <motion.div variants={fadeIn} className="group relative flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-gold/10 to-transparent rounded-3xl transform transition-transform group-hover:scale-105 duration-500 ease-out" />
              <div className="relative bg-surface-2 border border-border-subtle rounded-3xl p-6 shadow-sm hover:border-gold/30 transition-all duration-500 flex flex-col h-full">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-6 relative bg-surface-3">
                  <img 
                    src="/arun.jpg" 
                    alt="Arun Kumar" 
                    className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-110 grayscale hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-serif mb-1 text-linen">Arun Kumar</h3>
                  <p className="text-gold font-medium flex items-center justify-center gap-2 text-sm tracking-wide uppercase">
                    <Code2 className="w-4 h-4" /> Technology, Product & Vision
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Founder 2 */}
            <motion.div variants={fadeIn} className="group relative flex-1 mt-8 md:mt-12">
              <div className="absolute inset-0 bg-gradient-to-l from-gold/10 to-transparent rounded-3xl transform transition-transform group-hover:scale-105 duration-500 ease-out" />
              <div className="relative bg-surface-2 border border-border-subtle rounded-3xl p-6 shadow-sm hover:border-gold/30 transition-all duration-500 flex flex-col h-full">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-6 relative bg-surface-3">
                  <img 
                    src="/praveen.jpg" 
                    alt="Praveen Krishnan" 
                    className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-110 grayscale hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-serif mb-1 text-linen">Praveen Krishnan</h3>
                  <p className="text-gold font-medium flex items-center justify-center gap-2 text-sm tracking-wide uppercase">
                    <Paintbrush className="w-4 h-4" /> Artist, Creative Direction
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-6 text-linen">Our Story</h1>
            <h2 className="text-2xl md:text-3xl font-light text-stone mb-8">Built from Brushes, Code, and Courage</h2>
            <p className="text-xl md:text-2xl font-light leading-relaxed max-w-3xl mx-auto border-l-2 border-gold pl-6 text-left italic text-linen/90">
              "Fameuxarte began as a dream shared by an artist and a builder who believed creativity deserved a bigger stage."
            </p>
          </motion.div>
        </section>

        {/* Section 2: The Dream */}
        <section className="container py-16 md:py-24">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="max-w-3xl mx-auto space-y-8 text-lg md:text-xl leading-relaxed text-stone"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-linen mb-12 text-center">A Dream Born in the Quiet</h2>
            
            <p>
              In 2022, Fameuxarte didn't start in a boardroom with venture capital. It started in the quiet space between a blank canvas and a blinking cursor.
            </p>
            <p>
              We were two friends with a shared, aching realization: the art world was broken for the people who create it. One of us lived in the world of code and tech; the other lived in the world of paint and expression. Together, we watched brilliant artists pour their souls into masterpieces, only to struggle to find an audience, let alone make a living.
            </p>
            
            <div className="bg-surface-2 rounded-2xl p-8 my-12 border border-border-subtle relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
              <p className="text-linen font-serif text-xl md:text-2xl text-center italic relative z-10">
                We had no investors. We had no team. We had almost no money.
              </p>
            </div>

            <p>
              What we did have was a fierce, stubborn curiosity and a single, burning question: <strong className="text-gold font-medium">Can we build a digital sanctuary where art is actually valued?</strong>
            </p>
          </motion.div>
        </section>

        {/* Section 3: The Crash That Kept Us Alive */}
        <section className="bg-surface-1 py-20 md:py-32 border-y border-border-faint">
          <div className="container">
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerChildren}
              className="max-w-4xl mx-auto"
            >
              <motion.h2 variants={fadeIn} className="text-3xl md:text-5xl font-serif text-center mb-16 text-linen">
                The Crash That Kept Us Alive
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div variants={fadeIn} className="space-y-6 text-lg text-stone">
                  <p>
                    Our first attempt was humble—a fragile WordPress site built late at night after our day jobs. We didn't know anything about digital marketing or global sales. We just hoped.
                  </p>
                  <p>
                    For months, the silence was deafening.
                  </p>
                  
                  <div className="flex flex-col gap-4 py-6">
                    <div className="flex items-center gap-4 bg-obsidian p-4 rounded-xl border border-border-subtle">
                      <div className="w-12 h-12 rounded-full bg-surface-3 text-stone flex items-center justify-center font-serif text-xl">0</div>
                      <span className="font-medium text-linen tracking-wide uppercase text-sm">Sales</span>
                    </div>
                    <div className="flex items-center gap-4 bg-obsidian p-4 rounded-xl border border-border-subtle">
                      <div className="w-12 h-12 rounded-full bg-surface-3 text-stone flex items-center justify-center font-serif text-xl">0</div>
                      <span className="font-medium text-linen tracking-wide uppercase text-sm">Revenue</span>
                    </div>
                    <div className="flex items-center gap-4 bg-obsidian p-4 rounded-xl border border-border-subtle">
                      <div className="w-12 h-12 rounded-full bg-surface-3 text-stone flex items-center justify-center font-serif text-xl">0</div>
                      <span className="font-medium text-linen tracking-wide uppercase text-sm">Recognition</span>
                    </div>
                  </div>

                  <p>
                    Yet, every single time a random visitor clicked onto our page, it felt like a lifeline. It was proof that somewhere out there, a human being cared.
                  </p>
                </motion.div>

                <motion.div variants={fadeIn} className="relative">
                  <div className="absolute inset-0 bg-gold/5 rounded-3xl blur-3xl" />
                  <div className="relative bg-surface-2 border border-border-subtle rounded-3xl p-8 overflow-hidden">
                    <ServerCrash className="w-12 h-12 text-gold mb-6" />
                    <h3 className="text-2xl font-serif mb-4 text-linen">And then, everything broke.</h3>
                    <p className="text-stone mb-6 text-sm leading-relaxed">
                      Without the funds to scale or maintain it, our website crashed entirely. In a matter of seconds, years of late-night coding and layout design vanished into the digital ether. To anyone else, it was a sign to quit. It was the universe telling us to get practical, face reality, and move on.
                    </p>
                    <div className="border-l-2 border-gold pl-4 py-2">
                      <p className="font-medium text-linen text-sm">
                        But failure didn't defeat us; it educated us. It made us realize that this wasn't just a hobby anymore. We cared too much to let it die.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 4: Rebuilding in the Dark */}
        <section className="container py-20 md:py-32">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={fadeIn} className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-serif mb-6 text-linen">Rebuilding in the Dark</h2>
              <p className="text-xl text-stone">
                Instead of patching up the old pieces, we decided to build a fortress from scratch. We threw away the template builders and began hand-coding our own custom platform using Python.
              </p>
            </motion.div>

            {/* Visual Timeline */}
            <div className="relative py-12">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border-subtle -translate-x-1/2 hidden md:block" />
              
              <div className="space-y-12 relative">
                {/* Step 1 */}
                <motion.div variants={fadeIn} className="relative flex flex-col md:flex-row items-center md:justify-between group">
                  <div className="md:w-[45%] flex justify-end mb-4 md:mb-0">
                    <div className="bg-surface-2 border border-border-subtle p-6 rounded-2xl w-full relative z-10 group-hover:border-gold/30 transition-colors">
                      <div className="flex items-center gap-3 mb-3 text-stone">
                        <Bug className="w-5 h-5" />
                        <h4 className="font-medium text-linen tracking-wide uppercase text-sm">Deployment Errors</h4>
                      </div>
                      <p className="text-sm text-[#666]">Endless nights debugging server configurations and deployment pipelines.</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-obsidian border-2 border-gold z-20 hidden md:block" />
                  <div className="md:w-[45%] hidden md:block" />
                </motion.div>

                {/* Step 2 */}
                <motion.div variants={fadeIn} className="relative flex flex-col md:flex-row items-center md:justify-between group">
                  <div className="md:w-[45%] hidden md:block" />
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-obsidian border-2 border-gold z-20 hidden md:block" />
                  <div className="md:w-[45%] flex justify-start mb-4 md:mb-0">
                    <div className="bg-surface-2 border border-border-subtle p-6 rounded-2xl w-full relative z-10 group-hover:border-gold/30 transition-colors">
                      <div className="flex items-center gap-3 mb-3 text-stone">
                        <Database className="w-5 h-5" />
                        <h4 className="font-medium text-linen tracking-wide uppercase text-sm">Payment Gateway Failures</h4>
                      </div>
                      <p className="text-sm text-[#666]">Navigating international compliance, rejected APIs, and complex transaction flows.</p>
                    </div>
                  </div>
                </motion.div>

                {/* Step 3 */}
                <motion.div variants={fadeIn} className="relative flex flex-col md:flex-row items-center md:justify-between group">
                  <div className="md:w-[45%] flex justify-end mb-4 md:mb-0">
                    <div className="bg-surface-2 border border-border-subtle p-6 rounded-2xl w-full relative z-10 group-hover:border-gold/30 transition-colors">
                      <div className="flex items-center gap-3 mb-3 text-stone">
                        <Cpu className="w-5 h-5" />
                        <h4 className="font-medium text-linen tracking-wide uppercase text-sm">Server Crashes</h4>
                      </div>
                      <p className="text-sm text-[#666]">Optimizing databases and scaling infrastructure to handle high-res artwork.</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-obsidian border-2 border-gold z-20 hidden md:block" />
                  <div className="md:w-[45%] hidden md:block" />
                </motion.div>
              </div>
            </div>

            <motion.div variants={fadeIn} className="max-w-3xl mx-auto mt-16 text-lg text-stone space-y-6">
              <p>
                If our first phase was a test of faith, this phase was a test of endurance. Every single step forward felt like two steps back. Our screens were filled with bug reports, and our ears were filled with the quiet doubts of the people around us. 
                <span className="italic block mt-6 border-l border-border-subtle pl-6 text-[#888]">
                  "Why are you spending years on something that makes no money? Isn't it time to grow up?"
                </span>
              </p>
              <p>
                There were nights when continuing felt genuinely irrational. But while the world doubted, Praveen kept painting through the uncertainty, and Arun kept coding through the system failures. We refused to give up, because we knew that if we stopped, the artists who needed us would lose a voice.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Section 5: Fameuxarte Today */}
        <section className="bg-surface-1 py-20 md:py-32 relative overflow-hidden border-y border-border-faint">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=2000')] opacity-[0.03] mix-blend-screen object-cover grayscale" />
          
          <div className="container relative z-10">
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerChildren}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.h2 variants={fadeIn} className="text-3xl md:text-5xl font-serif mb-8 text-linen">
                Fameuxarte Today: Where Art Meets Grit
              </motion.h2>
              <motion.p variants={fadeIn} className="text-xl md:text-2xl font-light mb-8 text-stone leading-relaxed">
                Today, Fameuxarte is no longer just a website. It is a living, breathing community of creators, collectors, and believers who refuse to let original creativity be swallowed by mass production.
              </motion.p>
              <motion.p variants={fadeIn} className="text-lg md:text-xl text-stone mb-12">
                Every pixel, every feature, and every line of code on this platform was paid for in late nights, mistakes, and unrelenting persistence. We didn't just build an online marketplace—we built a <strong className="text-gold font-medium">Trust-First Art-Tech Ecosystem</strong> designed to protect the future of human creativity.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Section 6: What We Are Building Next */}
        <section className="container py-20 md:py-32">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeIn} className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif mb-4 text-linen">What We Are Building Next</h2>
              <p className="text-xl text-stone">Innovating the intersection of art and technology.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <motion.div variants={fadeIn} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-surface-3 to-transparent rounded-3xl transform transition-transform group-hover:scale-105 duration-500" />
                <div className="relative bg-surface-2 border border-border-subtle p-8 rounded-3xl transition-all duration-500 h-full flex flex-col items-center text-center hover:border-gold/20">
                  <div className="w-16 h-16 rounded-2xl bg-surface-3 border border-border-faint text-verified flex items-center justify-center mb-6 transform group-hover:-translate-y-1 transition-transform duration-500">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif mb-2 text-linen">ArtGuard™</h3>
                  <p className="text-xs font-medium text-gold mb-4 tracking-widest uppercase">AI Authentication</p>
                  <p className="text-[#666] text-sm leading-relaxed">Standing as a shield for traditional creators by using AI to verify whether an artwork is genuinely handmade, digitally reproduced, or machine-generated.</p>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div variants={fadeIn} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-surface-3 to-transparent rounded-3xl transform transition-transform group-hover:scale-105 duration-500" />
                <div className="relative bg-surface-2 border border-border-subtle p-8 rounded-3xl transition-all duration-500 h-full flex flex-col items-center text-center hover:border-gold/20">
                  <div className="w-16 h-16 rounded-2xl bg-surface-3 border border-border-faint text-gold flex items-center justify-center mb-6 transform group-hover:-translate-y-1 transition-transform duration-500">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif mb-2 text-linen">AI Pricing Engine</h3>
                  <p className="text-xs font-medium text-gold mb-4 tracking-widest uppercase">Smart Valuation</p>
                  <p className="text-[#666] text-sm leading-relaxed">Empowering artists to demand what they are worth by translating complex market signals and demand insights into confident pricing strategies.</p>
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div variants={fadeIn} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-surface-3 to-transparent rounded-3xl transform transition-transform group-hover:scale-105 duration-500" />
                <div className="relative bg-surface-2 border border-border-subtle p-8 rounded-3xl transition-all duration-500 h-full flex flex-col items-center text-center hover:border-gold/20">
                  <div className="w-16 h-16 rounded-2xl bg-surface-3 border border-border-faint text-stone flex items-center justify-center mb-6 transform group-hover:-translate-y-1 transition-transform duration-500">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif mb-2 text-linen">Global Discovery</h3>
                  <p className="text-xs font-medium text-gold mb-4 tracking-widest uppercase">Worldwide Reach</p>
                  <p className="text-[#666] text-sm leading-relaxed">Erasing borders so that a brilliant artist in a remote corner of the world can connect directly with a collector in a bustling metropolis.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Section 7: Closing Message */}
        <section className="container py-20 pb-32">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-surface-2 border border-border-subtle rounded-[2rem] p-10 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-serif mb-8 text-center text-linen">The Canvas Is Still Wet</h2>
                
                <div className="space-y-6 text-lg md:text-xl text-stone font-light mb-12">
                  <p>
                    Fameuxarte wasn't built in a day, a year, or a single try. It was built out of heartbreaks, restarts, and an unwavering belief that art deserves a grander stage.
                  </p>
                  <p>
                    We are still early in our journey. The paint is still wet, and the code is still evolving. But every time an artist joins our community, and every time a collector chooses to support original human creativity, our story grows.
                  </p>
                  <p className="font-medium text-gold italic">
                    Thank you for being part of the rewrite.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center justify-center pt-8 border-t border-border-subtle">
                  <div className="text-center md:text-right">
                    <p className="font-serif italic text-2xl md:text-3xl text-gold mb-1">Arun Kumar</p>
                    <p className="font-medium text-linen text-sm uppercase tracking-wider mt-2">Arun Kumar</p>
                    <p className="text-xs text-[#666] tracking-wide uppercase mt-1">Co-Founder, Fameuxarte</p>
                  </div>
                  
                  <div className="w-px h-16 bg-border-subtle hidden md:block" />
                  
                  <div className="text-center md:text-left">
                    <p className="font-serif italic text-2xl md:text-3xl text-gold mb-1">Praveen Krishnan</p>
                    <p className="font-medium text-linen text-sm uppercase tracking-wider mt-2">Praveen Krishnan</p>
                    <p className="text-xs text-[#666] tracking-wide uppercase mt-1">Co-Founder, Fameuxarte</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </MainLayout>
  );
};

export default OurStory;
