import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCommitteeMemberById } from '@/lib/supabase-queries';

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
  
  const member = await getCommitteeMemberById(id);

  if (!member || !member.is_published) {
    notFound();
  }

  const isFaculty = member.category === 'Faculty Advisors';

  // Professional bios based on role (unchanged logic)
  const generateAboutText = () => {
    const designation = member.designation.toLowerCase();
    
    if (isFaculty) {
      return `${member.name} serves as ${member.designation} for the GUCC Virtual Gaming Society, bringing extensive academic expertise and guidance to the organization. As a faculty advisor, they play a pivotal role in shaping the strategic direction of the society, ensuring alignment with academic objectives while fostering innovation in gaming culture. Their mentorship and oversight help maintain the society's commitment to excellence, providing students with invaluable insights and support in their gaming endeavors and organizational development.`;
    }
    
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
    
    return `${member.name} serves as ${member.designation} for the GUCC Virtual Gaming Society, contributing their expertise and dedication to the organization's mission. They play a vital role in organizing events, managing activities, and fostering a vibrant and inclusive gaming community on campus. Their commitment to excellence and passion for gaming helps create meaningful experiences and opportunities for all members of the society.`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans selection:bg-purple-500/30 transition-colors duration-300">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-gray-50 dark:bg-[#050505] transition-colors duration-300"></div>
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,50,200,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(88,28,135,0.15),transparent_70%)]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-10"></div>
      </div>

      <div className="relative z-10">

         <div className="max-w-7xl mx-auto px-6 pt-24 pb-8">
            {/* Navigation Badge */}
            <nav className="mb-8">
                <Link
                href={year ? `/committee?year=${year}` : '/committee'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-full transition-all hover:border-purple-500/30 shadow-sm hover:shadow-md"
                >
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Back to Committee</span>
                </Link>
            </nav>

            {/* Hero Profile Section */}
            <div className="grid md:grid-cols-[1.2fr,2fr] gap-12 items-start">
               
               {/* Left Column: Avatar & Identity Card */}
               <div className="space-y-6">
                  {/* Photo Card */}
                  <div className="relative group perspective-1000">
                     <div className={`absolute inset-0 bg-gradient-to-br ${isFaculty ? 'from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600' : 'from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600'} rounded-3xl blur-2xl opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity duration-700`}></div>
                     
                     <div className="relative bg-white dark:bg-[#0f1016] p-4 rounded-3xl border border-gray-200 dark:border-white/10 group-hover:border-gray-300 dark:group-hover:border-white/20 transition-all shadow-xl dark:shadow-2xl hover:shadow-2xl">
                        <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden relative bg-gray-100 dark:bg-gray-900">
                           {member.photo ? (
                              <img src={member.photo} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                           ) : (
                              <div className="w-full h-full bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                                 <span className="text-8xl font-black text-gray-200 dark:text-white/10">{member.name.charAt(0)}</span>
                              </div>
                           )}
                           {/* Overlay Gradient */}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent dark:from-[#0f1016] dark:opacity-60"></div>
                        </div>
                     </div>
                  </div>

                  {/* Identity / Stats Card (New) */}
                  <div className="bg-white dark:bg-[#0f1016] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-xl backdrop-blur-sm">
                     <div className="flex items-center justify-between mb-6">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-500 uppercase tracking-widest">Identity</span>
                        <div className="flex gap-2">
                           {member.student_id && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
                        </div>
                     </div>
                     
                     <div className="space-y-6">
                        {/* Student ID */}
                        {member.student_id ? (
                           <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Student ID</div>
                              <div className="font-mono text-xl text-gray-900 dark:text-white font-bold tracking-wider">{member.student_id}</div>
                           </div>
                        ) : (
                           <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role Type</div>
                              <div className="font-mono text-xl text-gray-900 dark:text-white font-bold tracking-wider">{isFaculty ? 'FACULTY' : 'EXECUTIVE'}</div>
                           </div>
                        )}

                        <div className="h-px bg-gray-100 dark:bg-white/5"></div>

                        {/* Social Acts */}
                        <div>
                           <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">Connect</div>
                           <div className="flex gap-3">
                              {member.linkedin && <SocialButton href={member.linkedin} type="linkedin" />}
                              {member.github && <SocialButton href={member.github} type="github" />}
                              {member.email && <SocialButton href={`mailto:${member.email}`} type="email" />}
                              {!member.linkedin && !member.github && !member.email && <span className="text-gray-500 dark:text-gray-600 text-sm italic">No social links provided</span>}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Column: Bio & Career */}
               <div className="space-y-10 pt-4">
                  <div>
                     <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4 ${
                        isFaculty
                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30'
                        : 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30'
                     }`}>
                        {member.category}
                     </span>
                     <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
                        {member.name}
                     </h1>
                     <p className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-900 dark:from-gray-200 dark:to-gray-500">
                        {member.designation}
                     </p>
                  </div>

                  <div className="prose prose-lg text-gray-600 dark:text-gray-400 leading-relaxed border-l-2 border-gray-200 dark:border-white/10 pl-6 dark:prose-invert">
                     <p>{generateAboutText()}</p>
                  </div>

                  {/* Premium Career Trajectory (Enhanced) */}
                  {member.previous_roles && member.previous_roles.length > 0 && !isFaculty && (
                     <div className="relative mt-12">
                         {/* Card Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/10 dark:to-transparent rounded-2xl -m-6 z-0 pointer-events-none"></div>
                        
                        <div className="relative z-10">
                           <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-600 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30">
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                              </span>
                              Career Trajectory
                           </h3>
                           
                           <div className="relative space-y-0">
                              {/* Vertical Line */}
                              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-400 via-purple-300 to-transparent dark:from-purple-500 dark:via-purple-500/30"></div>

                              {/* Current Role */}
                              <div className="relative pl-12 pb-10 group">
                                 <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white dark:bg-[#050505] border-2 border-purple-500 flex items-center justify-center z-10 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.3)] dark:shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></div>
                                 </div>
                                 <div className="bg-white dark:bg-[#0f1016] border border-purple-200 dark:border-purple-500/30 p-5 rounded-xl transition-all duration-300 group-hover:border-purple-400 dark:group-hover:border-purple-500/60 shadow-lg dark:shadow-none group-hover:shadow-purple-500/10 dark:group-hover:shadow-[0_5px_20px_-5px_rgba(168,85,247,0.2)]">
                                    <h4 className="text-gray-900 dark:text-white font-bold text-lg">{member.designation}</h4>
                                    <p className="text-purple-600 dark:text-purple-400 text-sm font-mono mt-1 font-bold tracking-wide">CURRENT • {year || 'NOW'}</p>
                                 </div>
                              </div>

                              {/* Previous Roles */}
                              {member.previous_roles.map((roleItem: any, idx: number) => {
                                 const roleTitle = typeof roleItem === 'string' ? roleItem : roleItem.role;
                                 const roleYear = typeof roleItem === 'object' ? roleItem.year : null;
                                 
                                 return (
                                    <div key={idx} className="relative pl-12 pb-8 last:pb-0 group opacity-80 hover:opacity-100 transition-opacity">
                                       <div className="absolute left-[6px] top-1.5 w-5 h-5 rounded-full bg-white dark:bg-[#050505] border-2 border-gray-400 dark:border-gray-600 z-10 group-hover:border-gray-600 dark:group-hover:border-white transition-colors"></div>
                                       
                                       <div className="bg-white dark:bg-[#0f1016] border border-gray-200 dark:border-white/5 p-4 rounded-xl hover:border-gray-300 dark:hover:bg-white/5 transition-all shadow-sm">
                                          <h4 className="text-gray-700 dark:text-gray-300 font-medium text-lg">{roleTitle}</h4>
                                          {roleYear && <p className="text-gray-500 text-sm font-mono mt-1">{roleYear}</p>}
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function SocialButton({ href, type }: { href: string; type: string }) {
   return (
      <a 
         href={href} 
         target="_blank" 
         rel="noopener noreferrer"
         className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all transform hover:scale-110 hover:-translate-y-1 shadow-lg ${
            type === 'linkedin' ? 'bg-[#0077b5] shadow-[#0077b5]/20' :
            type === 'github' ? 'bg-[#333] shadow-white/10' :
            'bg-gradient-to-br from-purple-600 to-blue-600 shadow-purple-500/20'
         }`}
      >
         {type === 'linkedin' && (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>
         )}
         {type === 'github' && (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
         )}
         {type === 'email' && (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
         )}
      </a>
   );
}
