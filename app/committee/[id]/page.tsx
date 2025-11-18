import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCommitteeMemberById } from '@/lib/supabase-queries';

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CommitteeMemberDetailPage({ 
  params,
  searchParams 
}: { 
  params: { id: string };
  searchParams: { year?: string };
}) {
  const { id } = await Promise.resolve(params);
  const { year } = await Promise.resolve(searchParams);
  
  // Fetch the committee member by ID
  const member = await getCommitteeMemberById(id);

  // If member not found or not published, show 404
  if (!member || !member.is_published) {
    notFound();
  }

  const isFaculty = member.category === 'Faculty Advisors';
  const isExecutive = member.category === 'Student Executives' || 
                      (member.category as any) === 'Executive Committee' || 
                      (member.category as any) === 'Student Members';

  // Generate professional about text based on role and category
  const generateAboutText = () => {
    const designation = member.designation.toLowerCase();
    
    if (isFaculty) {
      return `${member.name} serves as ${member.designation} for the GUCC Virtual Gaming Society, bringing extensive academic expertise and guidance to the organization. As a faculty advisor, they play a pivotal role in shaping the strategic direction of the society, ensuring alignment with academic objectives while fostering innovation in gaming culture. Their mentorship and oversight help maintain the society's commitment to excellence, providing students with invaluable insights and support in their gaming endeavors and organizational development.`;
    }
    
    // Executive-specific descriptions based on role
    if (designation.includes('president') || designation.includes('chairperson')) {
      return `${member.name} serves as ${member.designation} of the GUCC Virtual Gaming Society, leading the organization with vision and dedication. In this premier leadership role, they oversee all strategic initiatives, coordinate with university administration, and guide the executive team in creating an inclusive and thriving gaming community. Their leadership ensures that the society continues to grow, innovate, and provide exceptional gaming experiences and opportunities for all members.`;
    }
    
    if (designation.includes('vice president') || designation.includes('vice-president')) {
      return `${member.name} holds the position of ${member.designation} at the GUCC Virtual Gaming Society, serving as a key pillar in the organization's leadership structure. They work closely with the President to implement strategic initiatives, coordinate major events, and ensure smooth operations across all society activities. Their collaborative approach and organizational expertise contribute significantly to the society's success and member engagement.`;
    }
    
    if (designation.includes('secretary') || designation.includes('general secretary')) {
      return `${member.name} serves as ${member.designation} of the GUCC Virtual Gaming Society, managing the organization's communications, documentation, and administrative operations. They maintain comprehensive records of meetings and decisions, facilitate effective communication between members and leadership, and ensure transparency in all society proceedings. Their attention to detail and organizational skills keep the society running smoothly and efficiently.`;
    }
    
    if (designation.includes('treasurer') || designation.includes('finance')) {
      return `${member.name} serves as ${member.designation} for the GUCC Virtual Gaming Society, overseeing all financial operations and resource management. They are responsible for budgeting, financial planning, sponsorship management, and ensuring fiscal responsibility across all society activities. Their financial acumen and transparent management practices enable the society to maximize resources and deliver high-quality events and programs.`;
    }
    
    if (designation.includes('event') || designation.includes('program')) {
      return `${member.name} serves as ${member.designation} at the GUCC Virtual Gaming Society, specializing in creating memorable gaming experiences and community events. They conceptualize, plan, and execute engaging tournaments, workshops, and social gatherings that bring gamers together. Their creativity and organizational prowess ensure that every event runs smoothly and leaves a lasting positive impact on the gaming community.`;
    }
    
    if (designation.includes('media') || designation.includes('publicity') || designation.includes('marketing')) {
      return `${member.name} serves as ${member.designation} for the GUCC Virtual Gaming Society, managing the organization's public image and digital presence. They create compelling content, manage social media platforms, design promotional materials, and ensure the society's activities reach the widest possible audience. Their creative vision and communication skills help build and maintain the society's reputation both on campus and beyond.`;
    }
    
    if (designation.includes('technical') || designation.includes('tech') || designation.includes('it')) {
      return `${member.name} serves as ${member.designation} at the GUCC Virtual Gaming Society, providing technical expertise and infrastructure support for all society operations. They manage the organization's digital platforms, troubleshoot technical issues during events, and implement technological solutions to enhance member experience. Their technical proficiency ensures seamless operations and innovative approaches to community engagement.`;
    }
    
    // Default for other executive positions
    return `${member.name} serves as ${member.designation} for the GUCC Virtual Gaming Society, contributing their expertise and dedication to the organization's mission. They play a vital role in organizing events, managing activities, and fostering a vibrant and inclusive gaming community on campus. Their commitment to excellence and passion for gaming helps create meaningful experiences and opportunities for all members of the society.`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Background */}
      <section className={`relative h-96 overflow-hidden ${
        isFaculty 
          ? 'bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900' 
          : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'
      }`}>
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <ol className="flex items-center space-x-2 text-sm text-white/80">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
                <li>
                  <Link href="/committee" className="hover:text-white transition-colors">
                    Committee
                  </Link>
                </li>
                <li>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
                <li className="text-white">{member.name}</li>
              </ol>
            </nav>

            {/* Category Badge */}
            <div className="mb-4">
              <span className={`${
                isFaculty 
                  ? 'bg-purple-500/90' 
                  : 'bg-blue-500/90'
              } text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm`}>
                {member.category}
              </span>
            </div>

            {/* Name & Designation */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {member.name}
            </h1>
            <p className="text-xl text-white/90">
              {member.designation}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Photo and Contact */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24">
                {/* Photo */}
                <div className="mb-6">
                  <div className={`relative w-full aspect-square rounded-2xl overflow-hidden ${
                    isFaculty 
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  } flex items-center justify-center`}>
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-8xl font-bold text-white">
                        {member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Information
                  </h3>

                  {/* Email */}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.email}</p>
                      </div>
                    </a>
                  )}

                  {/* Student ID (for executives only) */}
                  {member.student_id && member.category === 'Student Executives' && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Student ID</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{member.student_id}</p>
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  {(member.facebook || member.linkedin || member.github) && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Social Media</p>
                      <div className="flex gap-2">
                        {member.facebook && (
                          <a
                            href={member.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                            title="Facebook"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          </a>
                        )}
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-700 hover:text-white rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                            title="LinkedIn"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </a>
                        )}
                        {member.github && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-800 hover:text-white rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                            title="GitHub"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  About
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                    {generateAboutText()}
                  </p>
                </div>
              </div>

              {/* Previous Roles Section (for executives) */}
              {member.previous_roles && member.previous_roles.length > 0 && !isFaculty && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Career in VGS
                  </h2>
                  
                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {member.previous_roles.length + 1}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Total Positions
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {member.previous_roles.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Previous Roles
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                        {new Set([
                          member.designation, 
                          ...member.previous_roles.map((r: any) => typeof r === 'string' ? r : r.role)
                        ]).size}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Different Roles
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    {/* Current Role */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-100 dark:ring-green-900/30"></div>
                        <div className="w-0.5 h-full bg-gradient-to-b from-green-500 to-gray-300 dark:to-gray-700"></div>
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border-l-4 border-green-500">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                              Current
                            </span>
                            <span className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full border border-green-200 dark:border-green-800">
                              {year || new Date().getFullYear()}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            {member.designation}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Previous Roles */}
                    {member.previous_roles.map((roleItem: any, index: number) => {
                      const role = typeof roleItem === 'string' ? roleItem : roleItem.role;
                      const roleYear = typeof roleItem === 'object' ? roleItem.year : null;
                      
                      return (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full ring-4 ring-purple-100 dark:ring-purple-900/30"></div>
                            {index < member.previous_roles.length - 1 && (
                              <div className="w-0.5 h-full bg-gradient-to-b from-purple-500 to-gray-300 dark:to-gray-700"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-purple-500">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Previous</span>
                                {roleYear && (
                                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                                    {roleYear}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                                {role}
                              </h3>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Back Button */}
              <div className="flex justify-center">
                <Link
                  href={year ? `/committee?year=${year}` : '/committee'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Committee
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
