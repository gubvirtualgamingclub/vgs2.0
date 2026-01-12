"use client";

import AdminHelpButton from '@/components/AdminHelpButton';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  TrophyIcon, 
  BoltIcon,
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
  ServerIcon
} from '@heroicons/react/24/outline'; // Using correct icon names

export default function AdminDashboard() {
  const stats = [
    {
      name: "Total Updates",
      value: "24",
      change: "+3 this month",
      icon: <BoltIcon className="w-6 h-6" />,
      gradient: "from-blue-600 to-cyan-600",
      bgFrom: "from-blue-500/10",
      bgTo: "to-cyan-500/10",
      border: "border-blue-500/20"
    },
    {
      name: "Active Events",
      value: "8",
      change: "5 upcoming",
      icon: <CalendarIcon className="w-6 h-6" />,
      gradient: "from-purple-600 to-pink-600",
      bgFrom: "from-purple-500/10",
      bgTo: "to-pink-500/10",
      border: "border-purple-500/20"
    },
    {
      name: "Tournaments",
      value: "3",
      change: "1 ongoing",
      icon: <TrophyIcon className="w-6 h-6" />,
      gradient: "from-yellow-500 to-orange-600",
      bgFrom: "from-yellow-500/10",
      bgTo: "to-orange-500/10",
      border: "border-yellow-500/20"
    },
    {
      name: "Committee Members",
      value: "12",
      change: "2 new positions",
      icon: <UserGroupIcon className="w-6 h-6" />,
      gradient: "from-green-500 to-emerald-600",
      bgFrom: "from-green-500/10",
      bgTo: "to-emerald-500/10",
      border: "border-green-500/20"
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "New update published",
      title: "Winter Championship 2025 Registration",
      time: "2 hours ago",
      type: "update",
    },
    {
      id: 2,
      action: "Event created",
      title: "Weekly Gaming Night - Nov 15",
      time: "5 hours ago",
      type: "event",
    },
    {
      id: 3,
      action: "Tournament updated",
      title: "Valorant Showdown - Schedule Changed",
      time: "1 day ago",
      type: "tournament",
    },
    {
      id: 4,
      action: "Committee member added",
      title: "New Technical Lead appointed",
      time: "2 days ago",
      type: "committee",
    },
    {
      id: 5,
      action: "Sponsor added",
      title: "Gaming Gear Pro - Platinum Sponsor",
      time: "3 days ago",
      type: "sponsor",
    },
  ];

  const quickActions = [
    {
      name: "Add Event",
      href: "/admin/activities",
      icon: "➕",
      color: "from-purple-600 to-indigo-600",
    },
    {
      name: "Manage Games",
      href: "/admin/games",
      icon: "🎮",
      color: "from-pink-600 to-rose-600",
    },
    {
      name: "Manage Tournament",
      href: "/admin/tournaments",
      icon: "🎯",
      color: "from-orange-500 to-red-600",
    },
    {
      name: "Registration Forms",
      href: "/admin/registration-forms",
      icon: "📋",
      color: "from-cyan-600 to-blue-600",
    },
  ];

  // Get secret admin path from environment
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH;

  // Process quick action paths to include the secret path
  const processedQuickActions = quickActions.map(action => ({
    ...action,
    href: action.href.replace('/admin', `/${adminPath}`)
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-white/10 p-8 md:p-12">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Admin</span>
              </h1>
              <p className="text-gray-300 max-w-xl">
                Here's what's happening in your gaming ecosystem today. You have <span className="text-white font-semibold">3 new updates</span> pending review.
              </p>
            </div>
            <div className="hidden lg:block relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative w-20 h-20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">👋</span>
                </div>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`
              relative overflow-hidden
              bg-gradient-to-br ${stat.bgFrom} ${stat.bgTo}
              backdrop-blur-xl border ${stat.border}
              rounded-2xl p-6 group hover:translate-y-[-4px] transition-all duration-300
            `}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.gradient} shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded bg-white/5 text-gray-300 border border-white/5">
                 {stat.change}
              </span>
            </div>
            <div className="relative z-10">
                <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wide">
                {stat.name}
                </h3>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-purple-400" />
                Recent Activity
              </h2>
              <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">View All</button>
            </div>
            <div className="divide-y divide-white/5">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-5 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border border-white/10
                        ${activity.type === 'update' ? 'bg-blue-500/10 text-blue-400' :
                          activity.type === 'event' ? 'bg-purple-500/10 text-purple-400' :
                          activity.type === 'tournament' ? 'bg-orange-500/10 text-orange-400' :
                          'bg-green-500/10 text-green-400'}
                    `}>
                        {activity.type === 'update' && <BoltIcon className="w-5 h-5" />}
                        {activity.type === 'event' && <CalendarIcon className="w-5 h-5" />}
                        {activity.type === 'tournament' && <TrophyIcon className="w-5 h-5" />}
                        {(activity.type === 'committee' || activity.type === 'sponsor') && <UserGroupIcon className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-purple-200 group-hover:text-purple-100 transition-colors">
                            {activity.action}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{activity.time}</span>
                      </div>
                      <p className="text-white font-bold truncate">
                        {activity.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-yellow-400" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              {processedQuickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="group relative overflow-hidden rounded-xl bg-black/20 hover:bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-300 block"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${action.color}`}></div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{action.icon}</span>
                        <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">{action.name}</span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ServerIcon className="w-5 h-5 text-green-400" />
              System Status
            </h2>
            <div className="space-y-4">
               <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                   <div className="flex justify-between items-center mb-2">
                       <span className="text-sm text-gray-400">Database</span>
                       <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">CONNECTED</span>
                   </div>
                   <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                       <div className="bg-green-500 h-full w-full animate-pulse"></div>
                   </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                       <p className="text-xs text-gray-500 mb-1">Version</p>
                       <p className="text-lg font-bold text-white">2.1.0</p>
                   </div>
                   <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                       <p className="text-xs text-gray-500 mb-1">Storage</p>
                       <p className="text-lg font-bold text-white">2.4 GB</p>
                   </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Built-in Instructions Menu (static) */}
      <AdminHelpButton
        title="📊 Admin Dashboard Guide"
        instructions={[
          "**Overview KPIs**: Monitor real-time statistics for Updates, Events, Tournaments, and Committee members.",
          "**Recent Activity**: Track the latest 5 system actions (creations, updates, deletions).",
          "**System Health**: Check database connection status and storage usage.",
          "**Quick Actions**: One-click access to frequently used modules."
        ]}
        tips={[
          "KPI cards are interactive - click them to jump to their respective pages.",
          "The dashboard auto-refreshes every 30 seconds to show the latest data.",
          "System Health indicators will turn red if there are connection issues."
        ]}
        actions={[
          {
            title: "🚀 Navigation Shortcuts",
            description:
              "**Events Management**:\n- Click `Add Event` to jump to Activities.\n\n**Tournament Ops**:\n- Click `Manage Tournament` for brackets & games.\n\n**System**:\n- Click `Registration Forms` to view user submissions."
          },
          {
            title: "⚡ Power User Tips",
            description: 
              "**Keyboard Shortcuts**:\n- Press `Ctrl + K` (Mac: `Cmd + K`) to open the global search bar (if available).\n- Use `Tab` to navigate through quick actions rapidly."
          }
        ]}
      />
    </div>
  );
}
