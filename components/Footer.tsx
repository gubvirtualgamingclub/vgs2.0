'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const externalLinks = [
  { 
    name: 'Green University of Bangladesh', 
    href: 'https://green.edu.bd',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  { 
    name: 'Computer Science & Engineering Department', 
    href: 'https://green.edu.bd/department-of-computer-science-engineering/',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
];

const contactInfo = {
  email: 'info@vgs.edu',
  phone: '+880 1234-567890',
  address: 'Computer Science Department, Building A, Room 301',
  university: 'University Campus, Dhaka, Bangladesh',
};

const developerInfo = [
  {
    name: 'MD. SAZIB',
    role: 'Full Stack Developer & Project Initiator',
    github: 'https://github.com/mdsazib',
    linkedin: 'https://linkedin.com/in/mdsazib',
    email: 'sazib@example.com',
    photo: '/members/md-sazib.png',
  },
  // Add more developers here dynamically
];

export default function Footer() {
  const [showDeveloperPopup, setShowDeveloperPopup] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Club Logo & Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {/* Club Logo - From /public/logos/ folder */}
              <Image
                src="/logos/vgs.png"
                alt="VGS Logo"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <div>
                <p className="text-lg font-semibold text-white">Virtual Gaming Society</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Bringing gamers together to compete, collaborate, and celebrate the world of gaming.
            </p>
            {/* University Logo - Fixed rectangular display */}
            <div className="pt-4 border-t border-gray-800">
              <div className="flex items-center">
                <Image
                  src="/logos/GUB-New.png"
                  alt="Green University of Bangladesh"
                  width={200}
                  height={60}
                  className="h-12 w-auto object-contain brightness-110"
                  style={{ maxWidth: '200px' }}
                />
              </div>
            </div>
          </div>

          {/* External Links with Animation */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {externalLinks.map((link, index) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-900/50 hover:to-blue-900/50 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 transform hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-500/20"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="text-white">
                        {link.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-300 group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2">
                        {link.name}
                      </span>
                    </div>
                    <svg 
                      className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all duration-300" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <svg
                  className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-sm hover:text-blue-400 transition-colors duration-200"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <svg
                  className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="text-sm hover:text-blue-400 transition-colors duration-200"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <svg
                  className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm">{contactInfo.address}</p>
                  <p className="text-sm">{contactInfo.university}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Follow Us
            </h3>
            <div className="flex space-x-3">
              <a
                href="#"
                className="h-10 w-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
                title="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-lg bg-gray-800 hover:bg-blue-400 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Twitter"
                title="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-lg bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
                title="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-lg bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="YouTube"
                title="YouTube"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Stay connected with us on social media for latest updates and announcements
            </p>
          </div>
        </div>

        {/* Bottom Bar - Developer Info */}
        <div className="mt-12 pt-8 border-t border-gray-800 space-y-6">
          {/* Developer Credits - Professional Card Design */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-500"></div>
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Developed by</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-500"></div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              {developerInfo.map((dev, index) => (
                <div 
                  key={index} 
                  className="group relative"
                  onMouseEnter={() => setShowDeveloperPopup(index)}
                  onMouseLeave={() => setShowDeveloperPopup(null)}
                >
                  {/* Developer Card */}
                  <div className="relative flex items-center gap-4 px-6 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl hover:border-cyan-500 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 hover:scale-105 cursor-pointer">
                    {/* Profile Photo with Glow */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5">
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                          {dev.photo ? (
                            <Image
                              src={dev.photo}
                              alt={dev.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-600 to-blue-700">
                              <span className="text-white font-bold text-xl">
                                {dev.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Status Indicator */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-gray-900 shadow-lg">
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-base mb-0.5 group-hover:text-cyan-400 transition-colors">
                        {dev.name}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium mb-1">
                        {dev.role}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-xs font-semibold rounded-full border border-cyan-500/30">
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <svg 
                      className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Enhanced Hover Popup */}
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-80 transition-all duration-300 z-50 ${
                      showDeveloperPopup === index
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible translate-y-2 pointer-events-none'
                    }`}
                  >
                    {/* Popup Card */}
                    <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-500/20 p-6 backdrop-blur-sm">
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl"></div>
                      
                      {/* Content */}
                      <div className="relative space-y-4">
                        {/* Header with Large Photo */}
                        <div className="flex flex-col items-center">
                          <div className="relative w-24 h-24 mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-lg opacity-50"></div>
                            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-1">
                              <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                                {dev.photo ? (
                                  <Image
                                    src={dev.photo}
                                    alt={dev.name}
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-600 to-blue-700">
                                    <span className="text-white font-bold text-3xl">
                                      {dev.name.substring(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                              Online
                            </div>
                          </div>
                          
                          <h4 className="text-white font-bold text-xl mb-1 text-center">
                            {dev.name}
                          </h4>
                          <p className="text-sm text-cyan-400 font-semibold mb-1 text-center">
                            {dev.role}
                          </p>
                          <p className="text-xs text-gray-400 text-center">
                            Full Stack Developer
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

                        {/* Contact Info */}
                        {dev.email && (
                          <a
                            href={`mailto:${dev.email}`}
                            className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all group/email"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">Email</p>
                              <p className="text-sm text-white font-medium truncate group-hover/email:text-cyan-400 transition-colors">
                                {dev.email}
                              </p>
                            </div>
                          </a>
                        )}

                        {/* Social Links */}
                        <div className="grid grid-cols-2 gap-3">
                          {dev.github && (
                            <a
                              href={dev.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-xl transition-all group/btn border border-gray-600 hover:border-cyan-500"
                            >
                              <svg className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-semibold text-white">GitHub</span>
                            </a>
                          )}
                          {dev.linkedin && (
                            <a
                              href={dev.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all group/btn"
                            >
                              <svg className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                              <span className="text-sm font-semibold text-white">LinkedIn</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-800 border-r border-b border-cyan-500/50 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright and Contributors */}
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-3 border-t border-gray-800 pt-6">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} Virtual Gaming Society. All rights reserved.
            </p>
            <Link
              href="/contributors"
              className="group relative flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/40 hover:to-pink-600/40 border border-purple-500/30 hover:border-purple-400 rounded-full transition-all duration-300 hover:scale-105"
              title="View Contributors"
            >
              <svg 
                className="w-4 h-4 text-purple-400 group-hover:text-pink-400 transition-colors animate-pulse" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-purple-300 group-hover:text-pink-300 transition-colors">
                Contributors
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
