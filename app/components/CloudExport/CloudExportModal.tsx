"use client";

import { useState, useEffect, useMemo } from "react";
import { useExpenses } from "@/app/context/ExpenseContext";
import { Modal } from "@/app/components/ui/Modal";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { CATEGORIES, Currency, Expense } from "@/app/types";
import { formatCurrency, cn } from "@/app/lib/utils";
import {
  Download,
  Mail,
  FileSpreadsheet,
  Calendar,
  Clock,
  Share2,
  QrCode,
  FileText,
  HardDrive,
  Cloud,
  CloudOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Trash2,
  Power,
  PowerOff,
  Link as LinkIcon,
  Copy,
  RefreshCw,
  ArrowRight,
  BarChart3,
  PieChart,
  FileSearch,
  Globe,
  Lock,
  Settings,
  ChevronRight,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type TabId =
  | "overview"
  | "email"
  | "sheets"
  | "backup"
  | "history"
  | "sharing"
  | "templates"
  | "integrations";

interface CloudExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Types for simulated data
interface BackupSchedule {
  id: string;
  frequency: "daily" | "weekly" | "monthly";
  time: string;
  format: "csv" | "json" | "pdf";
  destination: string;
  startDate: string;
  enabled: boolean;
}

interface ExportHistoryItem {
  id: string;
  date: string;
  format: string;
  destination: string;
  status: "completed" | "failed";
  recordCount: number;
}

interface CloudService {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  account?: string;
  lastSync?: string;
}

const defaultTabs = [
  { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "email", label: "Email Export", icon: <Mail className="h-4 w-4" /> },
  { id: "sheets", label: "Google Sheets", icon: <FileSpreadsheet className="h-4 w-4" /> },
  { id: "backup", label: "Backup Schedules", icon: <Clock className="h-4 w-4" /> },
  { id: "history", label: "Export History", icon: <RefreshCw className="h-4 w-4" /> },
  { id: "sharing", label: "Sharing & Links", icon: <Share2 className="h-4 w-4" /> },
  { id: "templates", label: "Templates", icon: <FileText className="h-4 w-4" /> },
  { id: "integrations", label: "Integrations", icon: <Globe className="h-4 w-4" /> },
] as const;

export function CloudExportModal({ isOpen, onClose }: CloudExportModalProps) {
  const { expenses } = useExpenses();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  // Email state
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailFormat, setEmailFormat] = useState<"csv" | "json" | "pdf">("csv");
  const [emailStartDate, setEmailStartDate] = useState("");
  const [emailEndDate, setEmailEndDate] = useState("");

  // Sheets state
  const [sheetsConnected, setSheetsConnected] = useState(false);
  const [sheetsAccount, setSheetsAccount] = useState("");
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState("");
  const [selectedSheet, setSelectedSheet] = useState("Sheet1");

  // Backup state
  const [schedules, setSchedules] = useState<BackupSchedule[]>([
    {
      id: "1",
      frequency: "daily",
      time: "09:00",
      format: "csv",
      destination: "Google Drive",
      startDate: new Date().toISOString().split("T")[0],
      enabled: true,
    },
  ]);
  const [showBackupForm, setShowBackupForm] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [backupTime, setBackupTime] = useState("09:00");
  const [backupFormat, setBackupFormat] = useState<"csv" | "json" | "pdf">("csv");
  const [backupDestination, setBackupDestination] = useState("Google Drive");
  const [backupStartDate, setBackupStartDate] = useState(new Date().toISOString().split("T")[0]);

  // History state
  const [history] = useState<ExportHistoryItem[]>([
    {
      id: "1",
      date: "2024-03-15 14:30",
      format: "CSV",
      destination: "email@example.com",
      status: "completed",
      recordCount: 142,
    },
    {
      id: "2",
      date: "2024-03-14 09:15",
      format: "JSON",
      destination: "Google Sheets",
      status: "completed",
      recordCount: 140,
    },
    {
      id: "3",
      date: "2024-03-13 16:45",
      format: "PDF",
      destination: "Dropbox",
      status: "failed",
      recordCount: 0,
    },
  ]);

  // Sharing state
  const [shareableLink, setShareableLink] = useState("");
  const [linkExpiry, setLinkExpiry] = useState("never");
  const [linkPassword, setLinkPassword] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Templates state
  const templates = useMemo(
    () => [
      {
        id: "tax",
        name: "Tax Report",
        description: "Optimized for tax filing - includes all expense categories with IRS-friendly formatting",
        format: "csv" as const,
        filters: {
          dateRange: { start: `${new Date().getFullYear() - 1}-01-01`, end: `${new Date().getFullYear() - 1}-12-31` },
          categories: CATEGORIES.map((c) => c.value),
        },
        columns: ["Date", "Category", "Amount", "Description"],
      },
      {
        id: "monthly",
        name: "Monthly Summary",
        description: "Aggregated monthly view with income vs expenses trends",
        format: "json" as const,
        filters: { dateRange: { start: "", end: "" }, categories: [] },
        columns: ["Month", "Total Income", "Total Expenses", "Net"],
      },
      {
        id: "category",
        name: "Category Analysis",
        description: "Deep-dive analysis spending patterns by category",
        format: "pdf" as const,
        filters: { dateRange: { start: "", end: "" }, categories: [] },
        columns: ["Category", "Total Spent", "Transaction Count", "Average"],
      },
    ],
    []
  );

  // Integrations state
  const [services, setServices] = useState<CloudService[]>([
    { id: "google", name: "Google Drive", icon: <HardDrive className="h-5 w-5" />, connected: false },
    { id: "dropbox", name: "Dropbox", icon: <Cloud className="h-5 w-5" />, connected: true, account: "user@dropbox.com", lastSync: "2 hours ago" },
    { id: "onedrive", name: "OneDrive", icon: <Cloud className="h-5 w-5" />, connected: false },
    { id: "box", name: "Box", icon: <CloudOff className="h-5 w-5" />, connected: false },
  ]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("overview");
      setExportMessage("");
      // Reset email fields
      setEmailTo("");
      setEmailSubject("");
      setEmailMessage("");
    }
  }, [isOpen]);

  const filteredExpenses = useMemo(() => {
    let result = expenses;
    // Email tab filters
    if (activeTab === "email" && emailStartDate) {
      result = result.filter((e) => e.date >= emailStartDate);
    }
    if (activeTab === "email" && emailEndDate) {
      result = result.filter((e) => e.date <= emailEndDate);
    }
    return result;
  }, [expenses, activeTab, emailStartDate, emailEndDate]);

  // Email export
  const handleEmailExport = async () => {
    if (!emailTo) {
      setExportMessage("Please enter a recipient email");
      return;
    }
    setIsExporting(true);
    setExportMessage("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setExportMessage(`Export successfully sent to ${emailTo}!`);
      setTimeout(() => {
        setEmailTo("");
        setEmailSubject("");
        setEmailMessage("");
        setExportMessage("");
      }, 2000);
    } catch {
      setExportMessage("Failed to send email");
    } finally {
      setIsExporting(false);
    }
  };

  // Sheets connection
  const handleConnectSheets = () => {
    setSheetsConnected(true);
    setSheetsAccount("user@gmail.com");
    setSelectedSpreadsheet("My Expenses");
  };

  const handleDisconnectSheets = () => {
    setSheetsConnected(false);
    setSheetsAccount("");
    setSelectedSpreadsheet("");
  };

  const handleExportToSheets = async () => {
    if (!sheetsConnected || !selectedSpreadsheet) {
      setExportMessage("Please connect and select a spreadsheet");
      return;
    }
    setIsExporting(true);
    setExportMessage("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setExportMessage(`Exported to "${selectedSpreadsheet}" in Google Sheets!`);
    } catch {
      setExportMessage("Failed to export to Google Sheets");
    } finally {
      setIsExporting(false);
    }
  };

  // Backup schedule management
  const addSchedule = () => {
    const newSchedule: BackupSchedule = {
      id: Date.now().toString(),
      frequency: backupFrequency,
      time: backupTime,
      format: backupFormat,
      destination: backupDestination,
      startDate: backupStartDate,
      enabled: true,
    };
    setSchedules((prev) => [...prev, newSchedule]);
    setShowBackupForm(false);
  };

  const toggleSchedule = (id: string) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // Sharing functions
  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    const token = Math.random().toString(36).substring(2, 15);
    const link = `${baseUrl}/shared/expenses?token=${token}`;
    setShareableLink(link);
    setQrCodeUrl(link);
  };

  const copyLinkToClipboard = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      setExportMessage("Link copied to clipboard!");
      setTimeout(() => setExportMessage(""), 2000);
    }
  };

  // Template application
  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      // Navigate to email tab and pre-fill
      setActiveTab("email");
      setEmailFormat(template.format);
      if (template.filters.dateRange.start) setEmailStartDate(template.filters.dateRange.start);
      if (template.filters.dateRange.end) setEmailEndDate(template.filters.dateRange.end);
      setExportMessage(`Template "${template.name}" applied! Configure your export details below.`);
      setTimeout(() => setExportMessage(""), 3000);
    }
  };

  // Cloud service connection toggle
  const toggleService = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          if (s.connected) {
            return { ...s, connected: false, account: undefined, lastSync: undefined };
          } else {
            // Simulate connection
            return {
              ...s,
              connected: true,
              account: `user@${s.name.toLowerCase().replace(" ", "")}.com`,
              lastSync: "Just now",
            };
          }
        }
        return s;
      })
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Cloud className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-primary-600">Connected Services</p>
              <p className="text-2xl font-bold text-primary-900">
                {services.filter((s) => s.connected).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-primary-600">Last Export</p>
              <p className="text-lg font-semibold text-primary-900">2 hours ago</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-primary-600">Active Schedules</p>
              <p className="text-2xl font-bold text-primary-900">{schedules.filter((s) => s.enabled).length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-2">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-primary-600">Total Records</p>
              <p className="text-2xl font-bold text-primary-900">{expenses.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-4 text-lg font-semibold text-primary-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              className="h-auto flex-col items-start gap-2 p-3"
              onClick={() => setActiveTab("email")}
            >
              <Mail className="h-6 w-6" />
              <span>Send Email</span>
            </Button>
            <Button
              variant="secondary"
              className="h-auto flex-col items-start gap-2 p-3"
              onClick={() => setActiveTab("sheets")}
            >
              <FileSpreadsheet className="h-6 w-6" />
              <span>Google Sheets</span>
            </Button>
            <Button
              variant="secondary"
              className="h-auto flex-col items-start gap-2 p-3"
              onClick={() => setActiveTab("backup")}
            >
              <Clock className="h-6 w-6" />
              <span>Schedule</span>
            </Button>
            <Button
              variant="secondary"
              className="h-auto flex-col items-start gap-2 p-3"
              onClick={() => setActiveTab("sharing")}
            >
              <Share2 className="h-6 w-6" />
              <span>Share</span>
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-4 text-lg font-semibold text-primary-900">Recent Activity</h3>
          <div className="space-y-3">
            {history.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-primary-100 pb-2 last:border-0">
                <div className="flex items-center gap-2">
                  {item.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-primary-900">{item.format} Export</p>
                    <p className="text-xs text-primary-600">{item.date}</p>
                  </div>
                </div>
                <span className="text-xs text-primary-500">{item.destination}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderEmailPanel = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-900">Email Data Export</h3>

      <div>
        <label className="mb-1 block text-sm font-medium text-primary-700">Recipient Email</label>
        <Input
          type="email"
          placeholder="colleague@example.com"
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-primary-700">Subject</label>
        <Input
          type="text"
          placeholder="Expense Report"
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-primary-700">Message (optional)</label>
        <textarea
          className="w-full rounded-md border border-primary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          rows={3}
          placeholder="Add a personal message..."
          value={emailMessage}
          onChange={(e) => setEmailMessage(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-primary-700">Format</label>
          <div className="flex gap-2">
            {(["csv", "json", "pdf"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setEmailFormat(f)}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm font-medium",
                  emailFormat === f
                    ? "border-primary-600 bg-primary-50 text-primary-900"
                    : "border-primary-200 text-primary-700 hover:bg-primary-50"
                )}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-primary-700">Date Range (optional)</label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={emailStartDate}
              onChange={(e) => setEmailStartDate(e.target.value)}
              placeholder="Start"
            />
            <Input
              type="date"
              value={emailEndDate}
              onChange={(e) => setEmailEndDate(e.target.value)}
              placeholder="End"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md bg-primary-50 p-3">
        <p className="text-sm text-primary-700">
          Will export {filteredExpenses.length} records
          {(emailStartDate || emailEndDate) && " (filtered by date)"}
        </p>
      </div>

      {exportMessage && (
        <div className={cn("rounded-md p-3 text-sm", exportMessage.includes("fail") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
          {exportMessage}
        </div>
      )}

      <Button onClick={handleEmailExport} disabled={isExporting || !emailTo} className="gap-2">
        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        Send Email Export
      </Button>
    </div>
  );

  const renderSheetsPanel = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-900">Google Sheets Integration</h3>

      {!sheetsConnected ? (
        <Card className="p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-blue-50 p-4">
              <FileSpreadsheet className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h4 className="mb-2 text-lg font-medium text-primary-900">Connect Google Sheets</h4>
          <p className="mb-4 text-sm text-primary-600">
            Link your Google account to export expenses directly to a spreadsheet
          </p>
          <Button onClick={handleConnectSheets} className="gap-2">
            <Cloud className="h-4 w-4" />
            Connect Account
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-primary-900">Connected as {sheetsAccount}</p>
                  <p className="text-sm text-primary-600">Last synced just now</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDisconnectSheets} className="gap-2">
                <PowerOff className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-700">Spreadsheet</label>
              <select
                className="w-full rounded-md border border-primary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                value={selectedSpreadsheet}
                onChange={(e) => setSelectedSpreadsheet(e.target.value)}
              >
                <option value="">Select a spreadsheet</option>
                <option value="My Expenses">My Expenses</option>
                <option value="Expense Tracker">Expense Tracker</option>
                <option value="Budget 2024">Budget 2024</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-700">Sheet Name</label>
              <Input
                type="text"
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                placeholder="Sheet1"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-primary-700">Format</label>
            <div className="flex gap-2">
              {(["csv", "json", "pdf"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm font-medium",
                    f === "csv"
                      ? "border-primary-600 bg-primary-50 text-primary-900"
                      : "border-primary-200 text-primary-700 hover:bg-primary-50"
                  )}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {exportMessage && (
            <div className={cn("rounded-md p-3 text-sm", exportMessage.includes("fail") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
              {exportMessage}
            </div>
          )}

          <Button onClick={handleExportToSheets} disabled={isExporting || !selectedSpreadsheet} className="gap-2">
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Export to Google Sheets
          </Button>
        </div>
      )}
    </div>
  );

  const renderBackupPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary-900">Automatic Backups</h3>
        <Button size="sm" onClick={() => setShowBackupForm(!showBackupForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Schedule
        </Button>
      </div>

      {showBackupForm && (
        <Card className="space-y-4 p-4">
          <h4 className="font-medium text-primary-900">Create New Schedule</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-700">Frequency</label>
              <select
                className="w-full rounded-md border border-primary-300 px-3 py-2 text-sm"
                value={backupFrequency}
                onChange={(e) => setBackupFrequency(e.target.value as any)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-700">Time</label>
              <Input type="time" value={backupTime} onChange={(e) => setBackupTime(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-700">Format</label>
              <select
                className="w-full rounded-md border border-primary-300 px-3 py-2 text-sm"
                value={backupFormat}
                onChange={(e) => setBackupFormat(e.target.value as any)}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-700">Destination</label>
              <select
                className="w-full rounded-md border border-primary-300 px-3 py-2 text-sm"
                value={backupDestination}
                onChange={(e) => setBackupDestination(e.target.value)}
              >
                <option value="Google Drive">Google Drive</option>
                <option value="Dropbox">Dropbox</option>
                <option value="OneDrive">OneDrive</option>
                <option value="Email">Email</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-primary-700">Start Date</label>
              <Input type="date" value={backupStartDate} onChange={(e) => setBackupStartDate(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={addSchedule}>
              Add Schedule
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowBackupForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleSchedule(schedule.id)}>
                  {schedule.enabled ? (
                    <Power className="h-5 w-5 text-green-600" />
                  ) : (
                    <PowerOff className="h-5 w-5 text-primary-400" />
                  )}
                </button>
                <div>
                  <p className="font-medium text-primary-900">
                    {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} at {schedule.time}
                  </p>
                  <p className="text-sm text-primary-600">
                    {schedule.format.toUpperCase()} → {schedule.destination}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-primary-500">Starting {schedule.startDate}</span>
                <Button variant="ghost" size="sm" onClick={() => deleteSchedule(schedule.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHistoryPanel = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-900">Export History</h3>
      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-primary-200">
          <thead className="bg-primary-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">Format</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">Destination</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">Records</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-100 bg-white">
            {history.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm text-primary-900">{item.date}</td>
                <td className="px-4 py-3 text-sm font-medium text-primary-900">{item.format}</td>
                <td className="px-4 py-3 text-sm text-primary-700">{item.destination}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      item.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status === "completed" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-primary-900">{item.recordCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  const renderSharingPanel = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-900">Share Your Data</h3>

      <Card className="p-4">
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-primary-700">Create Shareable Link</label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="https://expensetracker.ai/shared/..."
              value={shareableLink}
              readOnly
              className="flex-1"
            />
            <Button onClick={generateShareableLink} variant="secondary" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>

        {shareableLink && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={copyLinkToClipboard} variant="secondary" className="gap-2">
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-primary-700">Expires:</label>
                <select
                  className="rounded-md border border-primary-300 px-2 py-1 text-sm"
                  value={linkExpiry}
                  onChange={(e) => setLinkExpiry(e.target.value)}
                >
                  <option value="1h">1 Hour</option>
                  <option value="1d">1 Day</option>
                  <option value="1w">1 Week</option>
                  <option value="1m">1 Month</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="password" checked={linkPassword} onChange={() => setLinkPassword(!linkPassword)} />
                <label htmlFor="password" className="text-sm text-primary-700">
                  Require password
                </label>
              </div>
            </div>

            <div className="border-t border-primary-200 pt-4">
              <label className="mb-2 block text-sm font-medium text-primary-700">QR Code</label>
              <div className="flex justify-center rounded-lg bg-primary-50 p-4">
                <QRCodeSVG value={shareableLink} size={150} />
              </div>
              <p className="mt-2 text-center text-xs text-primary-500">
                Scan to view shared expenses on mobile
              </p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h4 className="mb-2 font-medium text-primary-900">Sharing Settings</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-900">Allow viewers to download</p>
              <p className="text-xs text-primary-600">Recipients can download the data</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-900">Track access</p>
              <p className="text-xs text-primary-600">Get notified when link is accessed</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-900">Watermark preview</p>
              <p className="text-xs text-primary-600">Add &quot;Preview&quot; watermark to shared data</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTemplatesPanel = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-900">Export Templates</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-primary-100 p-2">
                {template.id === "tax" && <FileSearch className="h-5 w-5 text-primary-700" />}
                {template.id === "monthly" && <BarChart3 className="h-5 w-5 text-primary-700" />}
                {template.id === "category" && <PieChart className="h-5 w-5 text-primary-700" />}
              </div>
              <div>
                <h4 className="font-medium text-primary-900">{template.name}</h4>
                <p className="text-xs text-primary-500">{template.format.toUpperCase()}</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-primary-600">{template.description}</p>
            <Button size="sm" onClick={() => applyTemplate(template.id)} className="w-full gap-2">
              <FileText className="h-4 w-4" />
              Use Template
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderIntegrationsPanel = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-900">Cloud Integrations</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <Card key={service.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {service.icon}
                <div>
                  <p className="font-medium text-primary-900">{service.name}</p>
                  {service.connected && (
                    <p className="text-xs text-primary-600">
                      {service.account} • {service.lastSync}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant={service.connected ? "danger" : "primary"}
                onClick={() => toggleService(service.id)}
                className="gap-2"
              >
                {service.connected ? (
                  <>
                    <PowerOff className="h-4 w-4" />
                    Disconnect
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-50 p-2">
            <Settings className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-primary-900">Need another integration?</h4>
            <p className="mb-3 text-sm text-primary-600">
              Request a new cloud service integration and we&apos;ll add it to our roadmap
            </p>
            <Button variant="secondary" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              Request Integration
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cloud Data Export & Sharing" size="lg">
      <div className="flex h-[600px] gap-4 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 overflow-y-auto border-r border-primary-200 pr-2">
          <nav className="space-y-1">
            {defaultTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary-100 text-primary-900"
                    : "text-primary-700 hover:bg-primary-50"
                )}
              >
                {tab.icon}
                {tab.label}
                <ChevronRight className="ml-auto h-4 w-4" />
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "email" && renderEmailPanel()}
          {activeTab === "sheets" && renderSheetsPanel()}
          {activeTab === "backup" && renderBackupPanel()}
          {activeTab === "history" && renderHistoryPanel()}
          {activeTab === "sharing" && renderSharingPanel()}
          {activeTab === "templates" && renderTemplatesPanel()}
          {activeTab === "integrations" && renderIntegrationsPanel()}
        </div>
      </div>
    </Modal>
  );
}
