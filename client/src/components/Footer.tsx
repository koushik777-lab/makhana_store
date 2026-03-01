import { Link } from "wouter";
import { Instagram, Twitter, Facebook, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-secondary font-display font-bold text-lg">
                M
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">Makhana<span className="text-accent">.</span></span>
            </Link>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed">
              Premium, hand-picked fox nuts roasted to perfection. Healthy snacking made deliciously simple.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-secondary transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-secondary transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-secondary transition-colors"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-lg mb-4 text-white">Shop</h4>
            <ul className="space-y-3 text-sm text-secondary-foreground/70">
              <li><Link href="/shop" className="hover:text-accent transition-colors">All Products</Link></li>
              <li><Link href="/shop?filter=classic" className="hover:text-accent transition-colors">Classic Range</Link></li>
              <li><Link href="/shop?filter=spicy" className="hover:text-accent transition-colors">Spicy Flavors</Link></li>
              <li><Link href="/shop?filter=sweet" className="hover:text-accent transition-colors">Sweet Treats</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-lg mb-4 text-white">Company</h4>
            <ul className="space-y-3 text-sm text-secondary-foreground/70">
              <li><a href="#" className="hover:text-accent transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Sourcing</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-lg mb-4 text-white">Stay Updated</h4>
            <p className="text-secondary-foreground/70 text-sm mb-4">Get 10% off your first order when you subscribe.</p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-white/10 border border-white/20 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-accent"
              />
              <button className="absolute right-1 top-1 bottom-1 w-10 bg-accent rounded-full flex items-center justify-center text-secondary hover:bg-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center md:flex justify-between items-center text-xs text-secondary-foreground/50">
          <p>© {new Date().getFullYear()} Makhana Brand. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
