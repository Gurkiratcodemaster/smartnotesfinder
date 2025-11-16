"use client";

import Navbar from "@/app/components/Navbar";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h1 className="text-4xl font-bold text-text-dark mb-4">About SmartNotesFinder</h1>
          <p className="text-xl text-text-light leading-relaxed">
            Empowering educators and students to discover, share, and collaborate on educational resources.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-text-dark mb-4 border-b-2 border-[#4A7766] pb-3">Our Mission</h2>
          <p className="text-text-dark text-lg leading-relaxed mb-4">
            SmartNotesFinder is dedicated to making educational resources easily accessible and discoverable. 
            We believe that quality learning materials should be shared freely among educators and students 
            to enhance the learning experience across all institutions.
          </p>
          <p className="text-text-dark text-lg leading-relaxed">
            Our platform enables teachers, educators, and institutions to upload, organize, and share educational 
            content while making it easy for students to find exactly what they need to succeed.
          </p>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-text-dark mb-6 border-b-2 border-[#4A7766] pb-3">Key Features</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-[#4A7766]">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-xl font-bold text-text-dark mb-2">Easy Upload & Organization</h3>
              <p className="text-text-light">
                Upload educational materials (PDFs, images, documents) and automatically organize them with metadata like subject, topic, and class level.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-[#4A7766]">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-xl font-bold text-text-dark mb-2">Smart Search & Discovery</h3>
              <p className="text-text-light">
                Find educational resources using intelligent search algorithms that match your learning goals and preferences.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-[#4A7766]">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="text-xl font-bold text-text-dark mb-2">Shareable Links</h3>
              <p className="text-text-light">
                Generate permanent shareable links for any educational resource with auto-generated README files and metadata.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-[#4A7766]">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-text-dark mb-2">Personalized Recommendations</h3>
              <p className="text-text-light">
                Get personalized content recommendations based on your subject, class level, and learning preferences.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-[#4A7766]">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-xl font-bold text-text-dark mb-2">Role-Based Access</h3>
              <p className="text-text-light">
                Different user roles (Students, Teachers, Institutions) with tailored features and permissions for each.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-[#4A7766]">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="text-xl font-bold text-text-dark mb-2">Secure & Reliable</h3>
              <p className="text-text-light">
                Your data is secure with encrypted authentication and reliable cloud storage integration.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-text-dark mb-6 border-b-2 border-[#4A7766] pb-3">How It Works</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#4A7766] text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-dark mb-1">Sign Up or Log In</h3>
                <p className="text-text-light">Create an account as a Student, Teacher, or Institution to get started.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#4A7766] text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-dark mb-1">Upload or Explore</h3>
                <p className="text-text-light">Upload educational materials or browse the collection of resources shared by others.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#4A7766] text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-dark mb-1">Organize & Share</h3>
                <p className="text-text-light">Add metadata, organize files, and generate shareable links for your resources.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#4A7766] text-white rounded-full flex items-center justify-center font-bold text-lg">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-dark mb-1">Discover & Learn</h3>
                <p className="text-text-light">Find resources through search, get personalized recommendations, and expand your learning.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-text-dark mb-4 border-b-2 border-[#4A7766] pb-3">Our Vision</h2>
          <p className="text-text-dark text-lg leading-relaxed mb-4">
            We envision a world where every student has access to quality educational resources, and every educator 
            can easily share their knowledge with the broader learning community.
          </p>
          <p className="text-text-dark text-lg leading-relaxed">
            By creating a collaborative platform, we aim to democratize education and make learning materials 
            universally accessible across all institutions and communities.
          </p>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#4A7766] to-[#3C6757] rounded-xl shadow-md p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-6 text-white/90">
            Join thousands of educators and students sharing and discovering educational resources.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="px-8 py-3 bg-white text-[#4A7766] font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign Up Now
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-3xl font-bold text-text-dark mb-4 border-b-2 border-[#4A7766] pb-3">Contact Us</h2>
          <p className="text-text-dark text-lg mb-4">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <div className="space-y-2 text-text-light">
            <p>📧 Email: <span className="text-text-dark font-semibold">support@smartnotesfinder.com</span></p>
            <p>🌐 Website: <span className="text-text-dark font-semibold">www.smartnotesfinder.com</span></p>
            <p>📱 Social: Follow us on social media for updates and announcements</p>
          </div>
        </div>
      </div>
    </div>
  );
}
