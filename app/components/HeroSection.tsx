"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Right side - Text content */}
        <div className="order-2 md:order-1 space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-text-dark leading-tight">
            Discover
            <span className="text-primary-green"> Knowledge</span>
            <br />
            Like Never Before
          </h1>
          <p className="text-lg text-text-light leading-relaxed">
            "Education is the most powerful weapon which you can use to change the world." 
            - Nelson Mandela
          </p>
          <p className="text-base text-text-light">
            Upload, search, and discover educational resources with AI-powered semantic search. 
            Find exactly what you need from a vast collection of study materials, research papers, 
            and academic content.
          </p>
          <div className="pt-4">
            <div className="inline-flex items-center gap-4 p-4 rounded-2xl border-2 border-[#4A7766] bg-white shadow-sm">
              <button className="px-8 py-3 bg-[#4A7766] text-white rounded-full font-semibold hover:bg-[#3C6757] hover:shadow-[0_0_20px_rgba(74,119,102,0.45)] transform hover:-translate-y-1 transition-all duration-300">
                Start Exploring
              </button>
            </div>
          </div>
        </div>

        {/* Left side - Image/Visual */}
        <div className="order-1 md:order-2 flex justify-center animate-slide-up">
          <div className="relative w-96 h-96 bg-gradient-to-br from-primary-green to-primary-green-light rounded-3xl shadow-2xl transform rotate-6 hover:rotate-3 transition-transform duration-500">
            <div className="absolute inset-4 bg-white rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl animate-bounce-gentle">📚</div>
                <h3 className="text-2xl font-bold text-primary-green">Smart Learning</h3>
                <p className="text-text-light px-4">AI-powered education platform for students and teachers</p>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl animate-bounce-gentle">
              ⭐
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-xl animate-bounce-gentle" style={{animationDelay: '1s'}}>
              🎓
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}