"use client";

export default function FeatureSection() {
  const features = [
    {
      icon: "📤",
      title: "Smart Upload System",
      description: "Upload PDFs with automatic metadata extraction and OCR text processing. Tag your files with class, subject, topic, and semester for easy organization.",
      gradient: "from-blue-400 to-blue-600"
    },
    {
      icon: "🔍", 
      title: "AI-Powered Search",
      description: "Find relevant content using advanced semantic search with sentence transformers. Search by content, labels, and get matching suggestions based on ratings.",
      gradient: "from-green-400 to-green-600"
    },
    {
      icon: "👥",
      title: "Multi-User Profiles", 
      description: "Dedicated profiles for students, teachers, and colleges. Upload permissions, rating systems, and personalized content recommendations for each user type.",
      gradient: "from-purple-400 to-purple-600"
    },
    {
      icon: "💡",
      title: "Smart Suggestions",
      description: "Get personalized file recommendations based on your profile, search history, and highly-rated content from the community.",
      gradient: "from-orange-400 to-orange-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-text-dark mb-6">
            Powerful Features for
            <span className="text-primary-green"> Modern Learning</span>
          </h2>
          <p className="text-lg text-text-light max-w-3xl mx-auto">
            Our platform combines cutting-edge AI technology with intuitive design to revolutionize 
            how you discover, organize, and share educational content.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-primary-bg rounded-2xl p-8 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-500 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold text-text-dark mb-4 group-hover:text-primary-green transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-text-light leading-relaxed">
                {feature.description}
              </p>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-green/5 to-primary-green-light/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="inline-flex items-center space-x-4 bg-primary-green rounded-full px-8 py-4 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <span className="font-semibold">Ready to get started?</span>
            <button className="bg-white text-primary-green px-6 py-2 rounded-full font-medium hover:bg-primary-bg transition-colors duration-300">
              Upload Your First File
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}