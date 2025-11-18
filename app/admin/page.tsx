'use client';

export default function AdminDashboard() {
  const stats = [
    {
      name: 'Total Updates',
      value: '24',
      change: '+3 this month',
      icon: '📢',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Active Events',
      value: '8',
      change: '5 upcoming',
      icon: '🎮',
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Tournaments',
      value: '3',
      change: '1 ongoing',
      icon: '🏆',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      name: 'Committee Members',
      value: '12',
      change: '2 new positions',
      icon: '👥',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'New update published',
      title: 'Winter Championship 2025 Registration',
      time: '2 hours ago',
      type: 'update',
    },
    {
      id: 2,
      action: 'Event created',
      title: 'Weekly Gaming Night - Nov 15',
      time: '5 hours ago',
      type: 'event',
    },
    {
      id: 3,
      action: 'Tournament updated',
      title: 'Valorant Showdown - Schedule Changed',
      time: '1 day ago',
      type: 'tournament',
    },
    {
      id: 4,
      action: 'Committee member added',
      title: 'New Technical Lead appointed',
      time: '2 days ago',
      type: 'committee',
    },
    {
      id: 5,
      action: 'Sponsor added',
      title: 'Gaming Gear Pro - Platinum Sponsor',
      time: '3 days ago',
      type: 'sponsor',
    },
  ];

  const quickActions = [
    { name: 'Create Update', href: '/admin/updates', icon: '📝', color: 'bg-blue-600' },
    { name: 'Add Event', href: '/admin/activities', icon: '➕', color: 'bg-purple-600' },
    { name: 'Manage Tournament', href: '/admin/tournaments', icon: '🎯', color: 'bg-orange-600' },
    { name: 'Registration Forms', href: '/admin/registration-forms', icon: '📋', color: 'bg-cyan-600' },
    { name: 'Edit Committee', href: '/admin/committee', icon: '✏️', color: 'bg-green-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back! Here&apos;s what&apos;s happening with VGS today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.name}</h3>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Recent Activity
              </h2>
            </div>
            <div className="divide-y divide-gray-700">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-6 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">{activity.action}</p>
                      <p className="text-white font-medium mb-1">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        activity.type === 'update'
                          ? 'bg-blue-900/50 text-blue-300'
                          : activity.type === 'event'
                          ? 'bg-purple-900/50 text-purple-300'
                          : activity.type === 'tournament'
                          ? 'bg-orange-900/50 text-orange-300'
                          : activity.type === 'committee'
                          ? 'bg-green-900/50 text-green-300'
                          : 'bg-pink-900/50 text-pink-300'
                      }`}
                    >
                      {activity.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Quick Actions
            </h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <a
                  key={action.name}
                  href={action.href}
                  className={`${action.color} hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-between group`}
                >
                  <span className="flex items-center">
                    <span className="text-xl mr-3">{action.icon}</span>
                    {action.name}
                  </span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              System Info
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Version</span>
                <span className="text-white font-semibold">2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Backup</span>
                <span className="text-white font-semibold">2 hours ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Database</span>
                <span className="text-green-400 font-semibold flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Connected
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Storage Used</span>
                <span className="text-white font-semibold">2.4 GB / 10 GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to VGS Admin Panel</h2>
            <p className="text-purple-100">
              Manage all aspects of the VGS website from this central dashboard. Use the
              navigation menu to access different sections.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
              <span className="text-6xl">🎮</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
