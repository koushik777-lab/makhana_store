import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Leaf, ShieldCheck, Heart, Sparkles, MapPin } from "lucide-react";

export default function About() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header section */}
                <motion.div
                    initial="hidden" animate="visible" variants={containerVariants}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6">
                        <Sparkles className="w-4 h-4" /> The Makhana Story
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="font-display font-black text-5xl md:text-7xl text-secondary mb-6 leading-tight tracking-tight">
                        Rooted in Tradition. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Crafted for Today.</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        We embarked on a journey to rediscover India's finest superfood. Our mission is simple: to bring you the crunchiest, most flavorful, and healthiest fox nuts directly from the ponds of Bihar to your pantry.
                    </motion.p>
                </motion.div>

                {/* Feature Grid */}
                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32"
                >
                    {[
                        { icon: Leaf, title: "100% Organic Origins", desc: "Harvested from the pristine wetlands, ensuring zero pesticides and nature's untouched goodness." },
                        { icon: Heart, title: "Roasted, Never Fried", desc: "We use traditional slow-roasting techniques that preserve nutrients without the oily guilt." },
                        { icon: ShieldCheck, title: "Premium Selection", desc: "Every single makhana is hand-graded for size, color, and absolute perfect crunchiness." }
                    ].map((feature, i) => (
                        <motion.div key={i} variants={itemVariants} className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-border/50 shadow-xl shadow-primary/5 hover:bg-white transition-colors group">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform group-hover:bg-primary group-hover:text-white">
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-xl text-secondary mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Story Split Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-border shadow-2xl relative">
                            <img src="/makhana-harvest.png" alt="Makhana Harvest" className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-auto bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/50">
                                <div className="flex items-center gap-2 mb-2 font-bold text-primary">
                                    <MapPin className="w-5 h-5" /> Bihar, India
                                </div>
                                <h3 className="font-display font-black text-2xl text-secondary">The Source of Perfection</h3>
                            </div>
                        </div>
                        {/* Decorative element */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent rounded-full -z-10 blur-xl opacity-30"></div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-8"
                    >
                        <h2 className="font-display font-black text-4xl text-secondary">From the ponds<br />to your palms.</h2>
                        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                            <p>Makhana (Fox Nut) has been a staple of Indian wellness for millennia. But as modern snacking became dominated by highly processed, fried alternatives, this incredible superfood was sidelined.</p>
                            <p>We set out to change that. By partnering directly with artisan farmers in Bihar—the global heartland of Makhana—we ensure fair trade practices while securing the highest grade harvest.</p>
                            <p>Back in our kitchen, we coat these perfect pops in olive oil and proprietary natural spice blends, completely reinventing the snacking experience without compromising on health.</p>
                        </div>
                    </motion.div>
                </div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="bg-secondary rounded-[3rem] p-12 md:p-16 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.2),transparent_50%)]"></div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-6">Ready to taste the revolution?</h2>
                        <p className="text-white/80 text-xl mb-10">Join thousands of smart snackers who have made the switch to premium Makhana.</p>
                        <Link href="/shop" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/20">
                            Explore Our Flavors <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
