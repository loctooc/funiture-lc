import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-secondary pb-20">
       <section className="bg-primary text-white py-24 text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            {/* Abstract background element */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-[80px] transform -translate-x-1/2 translate-y-1/2"></div>
         </div>
         <div className="container mx-auto px-6 relative z-10">
           <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 animate-fade-in">Get in Touch</h1>
           <p className="text-gray-300 text-lg max-w-xl mx-auto animate-slide-up">
             We'd love to hear from you. Visit our showroom, drop us a line, or give us a call.
           </p>
         </div>
       </section>

       <section className="container mx-auto px-6 -mt-16 relative z-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
         <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
            
            {/* Contact Info Column */}
            <div className="bg-primary p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-serif font-bold mb-8 text-accent">Contact Information</h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-5 group">
                    <div className="p-3 bg-white/5 rounded-lg group-hover:bg-accent/20 transition-colors duration-300">
                      <MapPin className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Our Showroom</h4>
                      <p className="text-gray-300 leading-relaxed font-light">
                        123 Furniture Avenue, Design District<br />
                        New York, NY 10013
                      </p>
                    </div>
                  </div>
                   <div className="flex items-start gap-5 group">
                    <div className="p-3 bg-white/5 rounded-lg group-hover:bg-accent/20 transition-colors duration-300">
                      <Phone className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Phone</h4>
                      <p className="text-gray-300 font-light">+1 (555) 123-4567</p>
                      <p className="text-sm text-gray-400 mt-1">Mon-Fri 9am-6pm</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-5 group">
                    <div className="p-3 bg-white/5 rounded-lg group-hover:bg-accent/20 transition-colors duration-300">
                      <Mail className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Email</h4>
                      <p className="text-gray-300 font-light">hello@furniture-lc.com</p>
                      <p className="text-gray-300 font-light">support@furniture-lc.com</p>
                    </div>
                  </div>
                </div>
              </div>

               <div className="mt-12 pt-12 border-t border-white/10 relative z-10">
                 <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-accent">
                   <Clock className="w-5 h-5" /> Opening Hours
                 </h4>
                 <ul className="text-gray-300 space-y-3 font-light">
                   <li className="flex justify-between border-b border-white/5 pb-2"><span>Mon - Fri</span> <span>9:00 AM - 8:00 PM</span></li>
                   <li className="flex justify-between border-b border-white/5 pb-2"><span>Saturday</span> <span>10:00 AM - 6:00 PM</span></li>
                   <li className="flex justify-between"><span>Sunday</span> <span className="text-accent">Closed</span></li>
                 </ul>
               </div>
            </div>

            {/* Contact Form Column */}
            <div className="p-8 md:p-12 bg-white">
              <h3 className="text-2xl font-serif font-bold text-primary mb-2">Send us a Message</h3>
              <p className="text-text-light mb-8">Fill out the form below and we'll get back to you shortly.</p>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-primary mb-2">First Name</label>
                    <input type="text" id="firstName" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-gray-300" placeholder="John" />
                  </div>
                   <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-primary mb-2">Last Name</label>
                    <input type="text" id="lastName" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-gray-300" placeholder="Doe" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2">Email Address</label>
                  <input type="email" id="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-gray-300" placeholder="john@example.com" />
                </div>

                 <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-primary mb-2">Subject</label>
                  <div className="relative">
                    <select id="subject" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all bg-white appearance-none cursor-pointer">
                      <option>General Inquiry</option>
                      <option>Order Support</option>
                      <option>Design Consultation</option>
                      <option>Warranty & Returns</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div>
                   <label htmlFor="message" className="block text-sm font-semibold text-primary mb-2">Message</label>
                   <textarea id="message" rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all resize-none placeholder:text-gray-300" placeholder="How can we help you?"></textarea>
                </div>

                <button type="submit" className="w-full bg-primary text-white font-medium py-4 rounded-lg hover:bg-accent transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                  Send Message
                  <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </button>
              </form>
            </div>

         </div>

         {/* Map Section */}
         <div className="mt-16 w-full h-[450px] rounded-2xl overflow-hidden shadow-lg bg-gray-100 relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a23e28c1191%3A0x49f75d3281df052a!2s150%20Park%20Row%2C%20New%20York%2C%20NY%2010007!5e0!3m2!1sen!2sus!4v1619628679549!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: "grayscale(100%) contrast(1.2) opacity(0.9)"  }} 
              allowFullScreen={true} 
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            ></iframe>
         </div>
       </section>
    </div>
  );
}
