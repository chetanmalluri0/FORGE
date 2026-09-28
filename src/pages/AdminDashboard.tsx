import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Dumbbell,
  Edit2,
  FileText,
  Filter,
  Flame,
  Layers,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import {
  AdminMetrics,
  GymClass,
  Lead,
  LeadStatus,
  Membership,
  NotificationLog,
  SettingItem,
  Trainer,
  User,
} from '../types/index.ts';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { adminUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'leads' | 'memberships' | 'classes' | 'trainers' | 'notifications' | 'settings'
  >('overview');

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [leadStatusFilter, setLeadStatusFilter] = useState('All');
  const [leadSearch, setLeadSearch] = useState('');
  const [membershipsList, setMembershipsList] = useState<Membership[]>([]);
  const [classesList, setClassesList] = useState<GymClass[]>([]);
  const [trainersList, setTrainersList] = useState<Trainer[]>([]);
  const [notificationsList, setNotificationsList] = useState<NotificationLog[]>([]);
  const [settingsList, setSettingsList] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal states for Create/Edit
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<GymClass | null>(null);
  const [classForm, setClassForm] = useState({
    title: '',
    category: 'Strength',
    description: '',
    trainerId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '07:00 AM',
    endTime: '08:00 AM',
    capacity: 12,
    room: 'Main Arena',
    intensity: 'High',
  });

  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [trainerForm, setTrainerForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    specialization: '',
    experience: '8+ Years',
    certifications: '',
    imageUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop',
    instagram: '@coach.forge',
  });

  // Test Notification state
  const [testNotif, setTestNotif] = useState({
    type: 'WHATSAPP',
    recipient: 'GYM_DESK',
    message: '🚨 Test alert dispatched from FORGE Management Console.',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [metRes, leadRes, memRes, clsRes, trnRes, notRes, setRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminLeads(leadStatusFilter, leadSearch),
        api.getAdminMemberships(),
        api.getClasses(),
        api.getTrainers(),
        api.getNotificationLogs(),
        api.getAllSettings(),
      ]);

      setMetrics(metRes);
      setLeadsList(leadRes);
      setMembershipsList(memRes);
      setClassesList(clsRes);
      setTrainersList(trnRes);
      setNotificationsList(notRes);
      setSettingsList(setRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [leadStatusFilter, leadSearch]);

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Lead update
  const handleLeadStatusChange = async (leadId: number, newStatus: LeadStatus) => {
    try {
      await api.updateLead(leadId, { status: newStatus });
      showSuccess(`Lead #${leadId} status updated to ${newStatus}.`);
      await loadData();
    } catch (err) {
      console.error('Failed to update lead:', err);
    }
  };

  const handleLeadNoteUpdate = async (leadId: number, notes: string) => {
    try {
      await api.updateLead(leadId, { notes });
      showSuccess(`Notes updated for lead #${leadId}.`);
      await loadData();
    } catch (err) {
      console.error('Failed to update notes:', err);
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    if (!confirm('Are you sure you want to permanently delete this lead?')) return;
    try {
      await api.deleteLead(leadId);
      showSuccess(`Lead #${leadId} deleted from database.`);
      await loadData();
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  // Membership update
  const handleMembershipStatusChange = async (memId: number, status: string) => {
    try {
      await api.updateMembershipStatus(memId, status);
      showSuccess(`Membership #${memId} marked as ${status}.`);
      await loadData();
    } catch (err) {
      console.error('Failed to update membership:', err);
    }
  };

  // Class Save
  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await api.updateClass(editingClass.id, {
          ...classForm,
          trainerId: Number(classForm.trainerId) || trainersList[0]?.id || 1,
          capacity: Number(classForm.capacity),
        });
        showSuccess(`Class "${classForm.title}" updated.`);
      } else {
        await api.createClass({
          ...classForm,
          trainerId: Number(classForm.trainerId) || trainersList[0]?.id || 1,
          capacity: Number(classForm.capacity),
        });
        showSuccess(`New class "${classForm.title}" published to schedule.`);
      }
      setIsClassModalOpen(false);
      setEditingClass(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save class');
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!confirm('Delete this class and all associated reservations?')) return;
    try {
      await api.deleteClass(classId);
      showSuccess('Class session deleted.');
      await loadData();
    } catch (err) {
      console.error('Failed to delete class:', err);
    }
  };

  // Trainer Save
  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTrainer) {
        await api.updateTrainer(editingTrainer.id, trainerForm);
        showSuccess(`Coach ${trainerForm.name} updated.`);
      } else {
        await api.createTrainer(trainerForm);
        showSuccess(`Coach ${trainerForm.name} added to roster.`);
      }
      setIsTrainerModalOpen(false);
      setEditingTrainer(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save trainer');
    }
  };

  const handleDeleteTrainer = async (trainerId: number) => {
    if (!confirm('Deactivate this coach from public roster?')) return;
    try {
      await api.deleteTrainer(trainerId);
      showSuccess('Coach deactivated.');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Send Test Notification
  const handleSendTestNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.sendTestNotification({
        type: testNotif.type,
        recipient: testNotif.recipient,
        message: testNotif.message,
      });
      showSuccess('Test notification dispatched and logged to database.');
      await loadData();
    } catch (err) {
      console.error('Failed to send test notification:', err);
    }
  };

  // Update Setting
  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await api.updateSetting(key, value);
      showSuccess(`Setting "${key}" updated.`);
      await loadData();
    } catch (err) {
      console.error('Failed to update setting:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-sans pb-24">
      {/* Top Admin Bar */}
      <div className="bg-[#050505] border-b border-[#202020] px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF3838] flex items-center justify-center font-display font-black text-black text-sm">
            F
          </div>
          <div>
            <span className="font-display font-black text-base uppercase tracking-tight text-white block leading-none">
              FORGE LAB MANAGEMENT CONSOLE
            </span>
            <span className="text-[10px] font-mono text-[#888888]">
              Role: <strong className="text-[#FF3838]">{adminUser?.role || 'ADMIN'}</strong> · Authenticated as {adminUser?.name || 'Administrator'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Refresh database records"
            className="p-2 bg-[#141414] hover:bg-[#202020] text-[#AAAAAA] border border-[#262626] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onBackToHome}
            className="text-xs uppercase tracking-wider font-bold text-[#AAAAAA] hover:text-white px-3 py-1.5 border border-[#2A2A2A] transition-colors"
          >
            View Live Site
          </button>

          <button
            onClick={logout}
            className="text-xs uppercase tracking-wider font-bold bg-[#FF3838]/10 text-[#FF3838] hover:bg-[#FF3838]/20 px-3 py-1.5 border border-[#FF3838]/30 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-[#25D366]/10 border-b border-[#25D366]/30 px-6 py-2.5 text-xs font-mono text-[#25D366] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-[#202020] pb-2 text-xs font-mono">
          {[
            { id: 'overview', label: 'Metric Overview', icon: Layers },
            { id: 'leads', label: `Lead Pipeline (${metrics?.newLeads || 0} New)`, icon: Users },
            { id: 'memberships', label: `Memberships (${metrics?.activeMembers || 0} Active)`, icon: UserCheck },
            { id: 'classes', label: 'Classes & Slots', icon: Calendar },
            { id: 'trainers', label: 'Coaches Roster', icon: Dumbbell },
            { id: 'notifications', label: 'WhatsApp / Email Audit', icon: MessageSquare },
            { id: 'settings', label: 'Gateway Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 whitespace-nowrap uppercase font-bold tracking-wider transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#FF3838] text-white bg-[#141414]'
                    : 'border-transparent text-[#777777] hover:text-[#CCCCCC]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top 6 KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-[#121212] border border-[#222222] p-4">
                <span className="text-[10px] font-mono text-[#777777] uppercase font-bold block">
                  Total Athletes
                </span>
                <span className="font-display font-black text-3xl text-white block mt-1">
                  {metrics?.totalMembers || 0}
                </span>
                <span className="text-[10px] text-[#25D366] font-mono">In Database</span>
              </div>

              <div className="bg-[#121212] border border-[#222222] p-4">
                <span className="text-[10px] font-mono text-[#777777] uppercase font-bold block">
                  Active Memberships
                </span>
                <span className="font-display font-black text-3xl text-[#25D366] block mt-1">
                  {metrics?.activeMembers || 0}
                </span>
                <span className="text-[10px] text-[#888888] font-mono">Currently Enrolled</span>
              </div>

              <div className="bg-[#121212] border border-[#222222] p-4">
                <span className="text-[10px] font-mono text-[#777777] uppercase font-bold block">
                  New Trial Leads
                </span>
                <span className="font-display font-black text-3xl text-[#FF3838] block mt-1">
                  {metrics?.newLeads || 0}
                </span>
                <span className="text-[10px] text-[#FF3838] font-mono">Pending Follow-up</span>
              </div>

              <div className="bg-[#121212] border border-[#222222] p-4">
                <span className="text-[10px] font-mono text-[#777777] uppercase font-bold block">
                  Today&apos;s Sessions
                </span>
                <span className="font-display font-black text-3xl text-white block mt-1">
                  {metrics?.todaysClasses || 0}
                </span>
                <span className="text-[10px] text-[#888888] font-mono">Scheduled Today</span>
              </div>

              <div className="bg-[#121212] border border-[#222222] p-4">
                <span className="text-[10px] font-mono text-[#777777] uppercase font-bold block">
                  Total Revenue
                </span>
                <span className="font-display font-black text-2xl text-white block mt-1">
                  ₹{metrics ? metrics.monthlyRevenue.toLocaleString() : '0'}
                </span>
                <span className="text-[10px] text-[#888888] font-mono">Enrolled Volume</span>
              </div>

              <div className="bg-[#121212] border border-[#222222] p-4">
                <span className="text-[10px] font-mono text-[#777777] uppercase font-bold block">
                  Upcoming Renewals
                </span>
                <span className="font-display font-black text-3xl text-amber-500 block mt-1">
                  {metrics?.upcomingRenewals || 0}
                </span>
                <span className="text-[10px] text-amber-500 font-mono">Next 7 Days</span>
              </div>
            </div>

            {/* Quick Live Preview: Recent Leads & Today's Classes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Leads */}
              <div className="bg-[#111111] border border-[#222222] p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-[#202020] pb-3">
                  <h3 className="font-display font-black text-lg uppercase tracking-tight text-white">
                    Recent Free Trial Leads
                  </h3>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="text-xs text-[#FF3838] uppercase font-bold font-mono hover:underline"
                  >
                    Manage All Leads →
                  </button>
                </div>
                <div className="space-y-3">
                  {leadsList.slice(0, 5).map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-[#161616] border border-[#242424] p-3 text-xs flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-white">{lead.name}</p>
                        <p className="text-[11px] text-[#888888]">
                          {lead.phone} · {lead.fitnessGoal}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 ${
                          lead.status === 'New'
                            ? 'bg-[#FF3838]/10 text-[#FF3838] border border-[#FF3838]/30'
                            : lead.status === 'Trial Scheduled'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            : 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Schedule Overview */}
              <div className="bg-[#111111] border border-[#222222] p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-[#202020] pb-3">
                  <h3 className="font-display font-black text-lg uppercase tracking-tight text-white">
                    Upcoming Arena Sessions
                  </h3>
                  <button
                    onClick={() => setActiveTab('classes')}
                    className="text-xs text-[#FF3838] uppercase font-bold font-mono hover:underline"
                  >
                    Manage Classes →
                  </button>
                </div>
                <div className="space-y-3">
                  {classesList.slice(0, 5).map((cls) => (
                    <div
                      key={cls.id}
                      className="bg-[#161616] border border-[#242424] p-3 text-xs flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-white">{cls.title}</p>
                        <p className="text-[11px] text-[#888888]">
                          {cls.date} · {cls.startTime} · {cls.room}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-[#AAAAAA]">
                        {cls.bookedCount}/{cls.capacity} spots
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEADS PIPELINE */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                  Trial Leads Management
                </h3>
                <p className="text-xs text-[#888888]">
                  Track walk-in and web free trial inquiries through conversion.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, phone, email..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    className="bg-[#141414] border border-[#2B2B2B] pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#FF3838]"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs">
                  {['All', 'New', 'Contacted', 'Trial Scheduled', 'Converted', 'Not Interested'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setLeadStatusFilter(st)}
                        className={`px-2.5 py-1 text-xs font-mono font-bold uppercase transition-colors ${
                          leadStatusFilter === st
                            ? 'bg-white text-black'
                            : 'bg-[#161616] text-[#888888] hover:text-white border border-[#282828]'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-[#111111] border border-[#222222] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#202020] text-[#777777] font-mono uppercase">
                    <th className="p-3.5">Athlete / Contact</th>
                    <th className="p-3.5">Goal & Wave</th>
                    <th className="p-3.5">Experience</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Staff Assigned</th>
                    <th className="p-3.5">Notes</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181818] text-[#CCCCCC]">
                  {leadsList.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#141414] transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-white text-sm">{lead.name}</p>
                        <p className="font-mono text-[11px] text-[#FF3838]">{lead.phone}</p>
                        <p className="text-[11px] text-[#777777]">{lead.email}</p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-white">{lead.fitnessGoal}</p>
                        <p className="text-[11px] font-mono text-[#888888]">{lead.preferredTime}</p>
                      </td>
                      <td className="p-3.5 max-w-xs text-[11px] text-[#AAAAAA]">
                        {lead.previousExperience}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={lead.status}
                          onChange={(e) => handleLeadStatusChange(lead.id, e.target.value as any)}
                          className="bg-[#1A1A1A] border border-[#333333] px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FF3838]"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Trial Scheduled">Trial Scheduled</option>
                          <option value="Converted">Converted</option>
                          <option value="Not Interested">Not Interested</option>
                        </select>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[#999999]">
                        {lead.assignedStaff || 'Unassigned'}
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <input
                          type="text"
                          defaultValue={lead.notes || ''}
                          placeholder="Add coach note..."
                          onBlur={(e) => handleLeadNoteUpdate(lead.id, e.target.value)}
                          className="w-full bg-[#181818] border border-[#282828] px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#FF3838]"
                        />
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 text-[#666666] hover:text-[#FF3838] transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MEMBERSHIPS */}
        {activeTab === 'memberships' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                Member Roster & Tiers
              </h3>
              <p className="text-xs text-[#888888]">
                Real-time active, pending, and expired contracts stored in Cloud SQL.
              </p>
            </div>

            <div className="bg-[#111111] border border-[#222222] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#202020] text-[#777777] font-mono uppercase">
                    <th className="p-3.5">Athlete</th>
                    <th className="p-3.5">Tier Plan</th>
                    <th className="p-3.5">Valid Range</th>
                    <th className="p-3.5">Amount Paid</th>
                    <th className="p-3.5">Payment Method</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181818] text-[#CCCCCC]">
                  {membershipsList.map((mem) => (
                    <tr key={mem.id} className="hover:bg-[#141414] transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-white text-sm">{mem.user?.name || `User #${mem.userId}`}</p>
                        <p className="text-[11px] text-[#777777]">{mem.user?.email}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="font-display font-bold text-sm uppercase text-white">
                          {mem.plan?.name || 'Standard'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[#AAAAAA]">
                        {new Date(mem.startDate).toLocaleDateString()} →{' '}
                        <strong className="text-white">{new Date(mem.endDate).toLocaleDateString()}</strong>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[#FF3838]">
                        ₹{mem.amountPaid.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-[11px] text-[#888888]">
                        {mem.paymentMethod}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={mem.status}
                          onChange={(e) => handleMembershipStatusChange(mem.id, e.target.value)}
                          className="bg-[#181818] border border-[#333333] px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FF3838]"
                        >
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Expired">Expired</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CLASSES & SCHEDULE */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                  Class Scheduling & Arena Capacity
                </h3>
                <p className="text-xs text-[#888888]">
                  Create, reschedule, or reassign head coaches for all platform sessions.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingClass(null);
                  setClassForm({
                    title: '',
                    category: 'Strength',
                    description: '',
                    trainerId: String(trainersList[0]?.id || '1'),
                    date: new Date().toISOString().split('T')[0],
                    startTime: '07:00 AM',
                    endTime: '08:00 AM',
                    capacity: 12,
                    room: 'Main Arena',
                    intensity: 'High',
                  });
                  setIsClassModalOpen(true);
                }}
                className="px-4 py-2 bg-[#FF3838] hover:bg-[#e02e2e] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Class</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classesList.map((cls) => (
                <div key={cls.id} className="bg-[#111111] border border-[#222222] p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF3838]">
                        {cls.category} · {cls.room}
                      </span>
                      <h4 className="font-display font-black text-lg uppercase text-white mt-0.5">
                        {cls.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-[#888888] bg-[#1A1A1A] px-2 py-0.5">
                      {cls.bookedCount}/{cls.capacity} booked
                    </span>
                  </div>

                  <p className="text-xs text-[#888888] line-clamp-2 leading-relaxed">
                    {cls.description}
                  </p>

                  <div className="bg-[#161616] p-2.5 text-xs font-mono text-[#AAAAAA] space-y-1">
                    <p>Date: {cls.date}</p>
                    <p>Time: {cls.startTime} - {cls.endTime}</p>
                    <p>Coach: {cls.trainer?.name || 'Staff'}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-[#1C1C1C]">
                    <button
                      onClick={() => {
                        setEditingClass(cls);
                        setClassForm({
                          title: cls.title,
                          category: cls.category,
                          description: cls.description,
                          trainerId: String(cls.trainerId),
                          date: cls.date,
                          startTime: cls.startTime,
                          endTime: cls.endTime,
                          capacity: cls.capacity,
                          room: cls.room,
                          intensity: cls.intensity,
                        });
                        setIsClassModalOpen(true);
                      }}
                      className="flex-1 py-1.5 bg-[#1B1B1B] hover:bg-[#252525] text-white text-xs font-bold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3 h-3 text-[#FF3838]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="p-1.5 text-[#777777] hover:text-[#FF3838] transition-colors"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: TRAINERS */}
        {activeTab === 'trainers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                  Master Coaches Directory
                </h3>
                <p className="text-xs text-[#888888]">
                  Manage staff credentials, bios, specializations, and assignments.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTrainer(null);
                  setTrainerForm({
                    name: '',
                    email: '',
                    phone: '',
                    bio: '',
                    specialization: 'Strength Training & Barbell Precision',
                    experience: '8+ Years',
                    certifications: 'CSCS, USAW Level 2',
                    imageUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop',
                    instagram: '@coach.forge',
                  });
                  setIsTrainerModalOpen(true);
                }}
                className="px-4 py-2 bg-[#FF3838] hover:bg-[#e02e2e] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Coach</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainersList.map((trainer) => (
                <div key={trainer.id} className="bg-[#111111] border border-[#222222] p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={trainer.imageUrl}
                        alt={trainer.name}
                        className="w-12 h-12 object-cover grayscale"
                      />
                      <div>
                        <h4 className="font-display font-black text-lg uppercase text-white leading-tight">
                          {trainer.name}
                        </h4>
                        <p className="text-xs font-mono text-[#FF3838]">{trainer.specialization}</p>
                      </div>
                    </div>

                    <p className="text-xs text-[#888888] line-clamp-3 leading-relaxed">
                      {trainer.bio}
                    </p>

                    <div className="bg-[#161616] p-2 text-[11px] font-mono text-[#AAAAAA]">
                      <p>Experience: {trainer.experience}</p>
                      <p className="truncate">Certs: {trainer.certifications || 'Verified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#1C1C1C]">
                    <button
                      onClick={() => {
                        setEditingTrainer(trainer);
                        setTrainerForm({
                          name: trainer.name,
                          email: trainer.email || '',
                          phone: trainer.phone || '',
                          bio: trainer.bio,
                          specialization: trainer.specialization,
                          experience: trainer.experience,
                          certifications: trainer.certifications || '',
                          imageUrl: trainer.imageUrl,
                          instagram: trainer.instagram || '',
                        });
                        setIsTrainerModalOpen(true);
                      }}
                      className="flex-1 py-1.5 bg-[#1B1B1B] hover:bg-[#252525] text-white text-xs font-bold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3 h-3 text-[#FF3838]" />
                      <span>Edit Coach</span>
                    </button>

                    <button
                      onClick={() => handleDeleteTrainer(trainer.id)}
                      className="p-1.5 text-[#666666] hover:text-[#FF3838] transition-colors"
                      title="Deactivate Coach"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS & WHATSAPP LOGS */}
        {activeTab === 'notifications' && (
          <div className="space-y-8">
            {/* Test Notification Sender */}
            <div className="bg-[#111111] border border-[#222222] p-6 space-y-4">
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span>Simulate / Dispatch Notification Test</span>
              </h3>
              <p className="text-xs text-[#888888]">
                Dispatches real-time simulated alerts through the notification pipeline and stores audit records.
              </p>

              <form onSubmit={handleSendTestNotification} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-[#777777] uppercase font-bold text-[10px] mb-1">
                    Channel
                  </label>
                  <select
                    value={testNotif.type}
                    onChange={(e) => setTestNotif({ ...testNotif, type: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] p-2 text-white"
                  >
                    <option value="WHATSAPP">WhatsApp Desk Alert</option>
                    <option value="EMAIL">Email Dispatch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#777777] uppercase font-bold text-[10px] mb-1">
                    Target Recipient
                  </label>
                  <input
                    type="text"
                    value={testNotif.recipient}
                    onChange={(e) => setTestNotif({ ...testNotif, recipient: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] p-2 text-white"
                    placeholder="GYM_DESK or email/phone"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#777777] uppercase font-bold text-[10px] mb-1">
                    Alert Content
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testNotif.message}
                      onChange={(e) => setTestNotif({ ...testNotif, message: e.target.value })}
                      className="w-full bg-[#161616] border border-[#2A2A2A] p-2 text-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#FF3838] hover:bg-[#e02e2e] text-white text-xs font-black uppercase tracking-wider shrink-0 transition-colors"
                    >
                      Trigger Test
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Notification Audit Log */}
            <div className="space-y-4">
              <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                Live Notification Logs (PostgreSQL Audit)
              </h3>

              <div className="bg-[#111111] border border-[#222222] overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#202020] text-[#777777] font-mono uppercase">
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Channel</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Recipient</th>
                      <th className="p-3.5">Subject & Content</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181818] text-[#CCCCCC]">
                    {notificationsList.map((log) => (
                      <tr key={log.id} className="hover:bg-[#141414] transition-colors">
                        <td className="p-3.5 font-mono text-[11px] text-[#777777] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 ${
                              log.type === 'WHATSAPP'
                                ? 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30'
                                : 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30'
                            }`}
                          >
                            {log.type}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-white">
                          {log.category}
                        </td>
                        <td className="p-3.5 font-mono text-xs text-[#FF3838]">
                          {log.recipient}
                        </td>
                        <td className="p-3.5 max-w-md">
                          {log.subject && (
                            <p className="font-bold text-white text-[11px]">{log.subject}</p>
                          )}
                          <p className="text-[11px] text-[#999999] truncate">{log.content}</p>
                        </td>
                        <td className="p-3.5 font-mono text-[10px] text-[#25D366] font-bold">
                          {log.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS & CONFIGURATION */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                Environment & Integration Configuration
              </h3>
              <p className="text-xs text-[#888888]">
                Configurable WhatsApp numbers, analytics measurement IDs, and gym operational parameters.
              </p>
            </div>

            <div className="bg-[#111111] border border-[#222222] divide-y divide-[#1C1C1C]">
              {settingsList.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-white">{item.key}</span>
                    <p className="text-[11px] text-[#888888]">{item.description || 'Config parameter'}</p>
                  </div>

                  <div className="flex items-center gap-2 max-w-md w-full sm:w-auto">
                    <input
                      type="text"
                      defaultValue={item.value}
                      id={`set_${item.key}`}
                      className="flex-1 bg-[#181818] border border-[#282828] px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#FF3838]"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`set_${item.key}`) as HTMLInputElement;
                        if (input) handleUpdateSetting(item.key, input.value);
                      }}
                      className="px-3 py-1.5 bg-[#FF3838] hover:bg-[#e02e2e] text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Class Modal (Create/Edit) */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#111111] border border-[#2A2A2A] p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-[#222222] pb-3">
              <h4 className="font-display font-black text-lg uppercase text-white">
                {editingClass ? 'Edit Session' : 'Create Arena Session'}
              </h4>
              <button onClick={() => setIsClassModalOpen(false)}>
                <X className="w-5 h-5 text-[#888888]" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3">
              <div>
                <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                  Class Title *
                </label>
                <input
                  type="text"
                  required
                  value={classForm.title}
                  onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                  placeholder="e.g. Forge Barbell Heavy"
                  className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={classForm.category}
                    onChange={(e) => setClassForm({ ...classForm, category: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white"
                  >
                    <option value="Strength">Strength</option>
                    <option value="HIIT">HIIT</option>
                    <option value="CrossFit">CrossFit</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Mobility">Mobility</option>
                    <option value="Boxing">Boxing</option>
                    <option value="Functional Training">Functional Training</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                    Assign Coach *
                  </label>
                  <select
                    value={classForm.trainerId}
                    onChange={(e) => setClassForm({ ...classForm, trainerId: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white"
                  >
                    {trainersList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialization.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={classForm.date}
                    onChange={(e) => setClassForm({ ...classForm, date: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                    Capacity (Cap) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="07:00 AM"
                    value={classForm.startTime}
                    onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08:00 AM"
                    value={classForm.endTime}
                    onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF3838] hover:bg-[#e02e2e] text-white text-xs font-black uppercase tracking-widest transition-colors"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trainer Modal */}
      {isTrainerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#111111] border border-[#2A2A2A] p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-[#222222] pb-3">
              <h4 className="font-display font-black text-lg uppercase text-white">
                {editingTrainer ? 'Edit Coach Roster' : 'Add Coach to Staff'}
              </h4>
              <button onClick={() => setIsTrainerModalOpen(false)}>
                <X className="w-5 h-5 text-[#888888]" />
              </button>
            </div>

            <form onSubmit={handleSaveTrainer} className="space-y-3">
              <div>
                <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                  Coach Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={trainerForm.name}
                  onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    required
                    value={trainerForm.specialization}
                    onChange={(e) => setTrainerForm({ ...trainerForm, specialization: e.target.value })}
                    placeholder="Barbell Precision"
                    className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                    Experience *
                  </label>
                  <input
                    type="text"
                    required
                    value={trainerForm.experience}
                    onChange={(e) => setTrainerForm({ ...trainerForm, experience: e.target.value })}
                    placeholder="10+ Years"
                    className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                  Bio
                </label>
                <textarea
                  rows={2}
                  required
                  value={trainerForm.bio}
                  onChange={(e) => setTrainerForm({ ...trainerForm, bio: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                  Certifications
                </label>
                <input
                  type="text"
                  value={trainerForm.certifications}
                  onChange={(e) => setTrainerForm({ ...trainerForm, certifications: e.target.value })}
                  placeholder="CSCS, USAW Level 2"
                  className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[#888888] font-bold text-[10px] uppercase mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={trainerForm.imageUrl}
                  onChange={(e) => setTrainerForm({ ...trainerForm, imageUrl: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2A2A2A] p-2 text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF3838] hover:bg-[#e02e2e] text-white text-xs font-black uppercase tracking-widest transition-colors"
                >
                  Save Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
