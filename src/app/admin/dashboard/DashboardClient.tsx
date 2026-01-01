"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { LogOut, User as UserIcon, Users, Building2, Mail, ExternalLink, Eye, Calendar, Wrench, FileText, Phone } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { AuthNav } from "@/components/auth-nav";

type TalentStatus = 'under_review' | 'interviewing' | 'training' | 'pending_matching' | 'matched' | 'rejected';

interface Talent {
  id: string;
  name: string;
  email: string;
  country_code: string | null;
  phone_number: string | null;
  role: string;
  english_level: string;
  portfolio: string;
  shipped: string;
  tools: string | null;
  cv_url: string | null;
  cv_filename: string | null;
  email_status: string | null;
  application_status: TalentStatus;
  created_at?: string;
}

interface Company {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  country_code: string | null;
  phone_number: string | null;
  website: string | null;
  company_size: string;
  // REMOVED: roles_needed, project_type, budget_range, project_description, application_status
  // Project fields are now exclusively in hiring_requests table
  // application_status removed - companies don't have application status in multi-project model
  email_status: string | null;
  created_at?: string;
}

interface HiringRequest {
  id: string;
  company_id: string;
  request_title: string;
  roles_needed: string;
  project_type: string;
  budget_range: string | null;
  project_description: string;
  application_status: string;
  request_status: 'open' | 'filled' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  matched_talent_id?: string | null;
  companies?: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
  };
}

interface DashboardClientProps {
  user: User;
  talents: Talent[];
  companies: Company[];
  hiringRequests: HiringRequest[];
}

export default function DashboardClient({ user, talents, companies, hiringRequests }: DashboardClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<HiringRequest | null>(null);
  const [statusConfirmDialog, setStatusConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'talent' | 'request';
    id: string;
    currentStatus: TalentStatus | string;
    newStatus: TalentStatus | string;
    name: string;
  } | null>(null);

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(t("auth.logout.error"));
      return;
    }

    toast.success(t("auth.logout.success"));
    router.push("/");
    router.refresh();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleTalentStatusChange = (talentId: string, newStatus: TalentStatus) => {
    const talent = talents.find(t => t.id === talentId);
    if (!talent || talent.application_status === newStatus) return;

    setStatusConfirmDialog({
      isOpen: true,
      type: 'talent',
      id: talentId,
      currentStatus: talent.application_status,
      newStatus: newStatus,
      name: talent.name
    });
  };


  const confirmStatusUpdate = async () => {
    if (!statusConfirmDialog) return;

    const { type, id, newStatus } = statusConfirmDialog;

    // Determine endpoint based on type
    const endpoint =
      type === 'talent' ? `/api/talents/${id}/status` :
      `/api/hiring-requests/${id}/status`;

    const successKey =
      type === 'talent' ? "dashboard.talents.statusUpdated" :
      "dashboard.hiringRequests.statusUpdated";

    const errorKey =
      type === 'talent' ? "dashboard.talents.statusUpdateFailed" :
      "dashboard.hiringRequests.statusUpdateFailed";

    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ application_status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(t(successKey));
      setStatusConfirmDialog(null);
      router.refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t(errorKey));
    }
  };

  const talentStatuses: { value: TalentStatus; labelKey: string }[] = [
    { value: 'under_review', labelKey: 'dashboard.status.talent.underReview' },
    { value: 'interviewing', labelKey: 'dashboard.status.talent.interviewing' },
    { value: 'training', labelKey: 'dashboard.status.talent.training' },
    { value: 'pending_matching', labelKey: 'dashboard.status.talent.pendingMatching' },
    { value: 'matched', labelKey: 'dashboard.status.talent.matched' },
    { value: 'rejected', labelKey: 'dashboard.status.talent.rejected' },
  ];

  return (
    <>
      <AuthNav />
      <div className="min-h-screen bg-background pt-24 p-8">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              {t("dashboard.title")}
            </h1>
            <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 me-2" />
            {t("auth.logout.button")}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.stats.totalTalents")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{talents.length}</div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.stats.talentsDesc")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.stats.totalCompanies")}
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.stats.companiesDesc")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.profile.title")}
              </CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{user.user_metadata?.full_name || "Admin"}</div>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <Tabs defaultValue="talents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="talents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("dashboard.tabs.talents")} ({talents.length})
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t("dashboard.tabs.companies")} ({companies.length})
            </TabsTrigger>
            <TabsTrigger value="hiring-requests" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t("dashboard.hiringRequests.titleAdmin")} ({hiringRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="talents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.talents.title")}</CardTitle>
                <CardDescription>{t("dashboard.talents.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("dashboard.talents.table.name")}</TableHead>
                      <TableHead>{t("dashboard.talents.table.email")}</TableHead>
                      <TableHead>{t("dashboard.talents.table.phone")}</TableHead>
                      <TableHead>{t("dashboard.talents.table.role")}</TableHead>
                      <TableHead>{t("dashboard.talents.table.englishLevel")}</TableHead>
                      <TableHead>{t("dashboard.talents.table.tools")}</TableHead>
                      <TableHead>{t("dashboard.talents.table.portfolio")}</TableHead>
                      <TableHead>{t("dashboard.talents.table.cv")}</TableHead>
                      <TableHead>{t("dashboard.talents.table.appliedDate")}</TableHead>
                      <TableHead>{t("dashboard.talents.table.status")}</TableHead>
                      <TableHead>{t("dashboard.talents.table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {talents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center text-muted-foreground">
                          {t("dashboard.talents.empty")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      talents.map((talent) => (
                        <TableRow key={talent.id}>
                          <TableCell className="font-medium">{talent.name}</TableCell>
                          <TableCell>
                            <a href={`mailto:${talent.email}`} className="flex items-center gap-1 text-sm hover:underline">
                              <Mail className="h-3 w-3" />
                              {talent.email}
                            </a>
                          </TableCell>
                          <TableCell>
                            {talent.phone_number ? (
                              <a href={`tel:${talent.country_code}${talent.phone_number}`} className="flex items-center gap-1 text-sm hover:underline">
                                <Phone className="h-3 w-3" />
                                {talent.country_code} {talent.phone_number}
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[150px] truncate">{talent.role}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{talent.english_level}</Badge>
                          </TableCell>
                          <TableCell>
                            {talent.tools ? (
                              <div className="flex items-center gap-1 max-w-[200px]">
                                <Wrench className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{talent.tools}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {talent.portfolio ? (
                              <a
                                href={talent.portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {t("dashboard.talents.table.viewPortfolio")}
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {talent.cv_url ? (
                              <a
                                href={talent.cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                              >
                                <FileText className="h-3 w-3" />
                                {t("dashboard.talents.table.viewCV")}
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(talent.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={talent.application_status}
                              onValueChange={(value) => handleTalentStatusChange(talent.id, value as TalentStatus)}
                            >
                              <SelectTrigger className="w-[180px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {talentStatuses.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {t(status.labelKey)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTalent(talent)}
                              className="h-8"
                            >
                              <Eye className="h-4 w-4 me-1" />
                              {t("dashboard.talents.table.details")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.companies.title")}</CardTitle>
                <CardDescription>{t("dashboard.companies.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("dashboard.companies.table.companyName")}</TableHead>
                      <TableHead>{t("dashboard.companies.table.contactName")}</TableHead>
                      <TableHead>{t("dashboard.companies.table.email")}</TableHead>
                      <TableHead>{t("dashboard.companies.table.phone")}</TableHead>
                      <TableHead>{t("dashboard.companies.table.companySize")}</TableHead>
                      <TableHead>{t("dashboard.companies.table.submittedDate")}</TableHead>
                      <TableHead>{t("dashboard.companies.table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          {t("dashboard.companies.empty")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">
                            {company.website ? (
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:underline max-w-[150px] truncate"
                              >
                                {company.company_name}
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            ) : (
                              <div className="max-w-[150px] truncate">{company.company_name}</div>
                            )}
                          </TableCell>
                          <TableCell>{company.contact_name}</TableCell>
                          <TableCell>
                            <a href={`mailto:${company.email}`} className="flex items-center gap-1 text-sm hover:underline">
                              <Mail className="h-3 w-3" />
                              {company.email}
                            </a>
                          </TableCell>
                          <TableCell>
                            {company.phone_number ? (
                              <a href={`tel:${company.country_code}${company.phone_number}`} className="flex items-center gap-1 text-sm hover:underline">
                                <Phone className="h-3 w-3" />
                                {company.country_code} {company.phone_number}
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{company.company_size}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(company.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedCompany(company)}
                              className="h-8"
                            >
                              <Eye className="h-4 w-4 me-1" />
                              {t("dashboard.companies.table.details")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hiring Requests Tab */}
          <TabsContent value="hiring-requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.hiringRequests.titleAdmin")}</CardTitle>
                <CardDescription>{t("dashboard.hiringRequests.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("dashboard.hiringRequests.table.requestTitle")}</TableHead>
                      <TableHead>{t("dashboard.hiringRequests.table.company")}</TableHead>
                      <TableHead>{t("dashboard.hiringRequests.table.role")}</TableHead>
                      <TableHead>{t("dashboard.hiringRequests.table.projectType")}</TableHead>
                      <TableHead>{t("dashboard.hiringRequests.table.budget")}</TableHead>
                      <TableHead>{t("dashboard.hiringRequests.table.requestStatus")}</TableHead>
                      <TableHead>{t("dashboard.hiringRequests.table.applicationStatus")}</TableHead>
                      <TableHead>{t("dashboard.hiringRequests.table.created")}</TableHead>
                      <TableHead>{t("dashboard.hiringRequests.table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hiringRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          {t("dashboard.hiringRequests.table.empty")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      hiringRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.request_title}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{request.companies?.company_name}</span>
                              <span className="text-xs text-muted-foreground">{request.companies?.contact_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{request.roles_needed}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.project_type}</Badge>
                          </TableCell>
                          <TableCell>{request.budget_range || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={request.request_status === 'filled' ? 'default' : 'secondary'}>
                              {t(`dashboard.hiringRequests.status.${request.request_status}`)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={request.application_status}
                              onValueChange={(value) => {
                                setStatusConfirmDialog({
                                  isOpen: true,
                                  type: 'request',
                                  id: request.id,
                                  currentStatus: request.application_status,
                                  newStatus: value,
                                  name: request.request_title
                                });
                              }}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="under_review">{t("dashboard.hiringRequests.applicationStatus.under_review")}</SelectItem>
                                <SelectItem value="reviewing_candidates">{t("dashboard.hiringRequests.applicationStatus.reviewing_candidates")}</SelectItem>
                                <SelectItem value="interviewing_candidates">{t("dashboard.hiringRequests.applicationStatus.interviewing_candidates")}</SelectItem>
                                <SelectItem value="negotiating">{t("dashboard.hiringRequests.applicationStatus.negotiating")}</SelectItem>
                                <SelectItem value="matched">{t("dashboard.hiringRequests.applicationStatus.matched")}</SelectItem>
                                <SelectItem value="rejected">{t("dashboard.hiringRequests.applicationStatus.rejected")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{formatDate(request.created_at)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4 me-1" />
                              {t("dashboard.hiringRequests.table.viewDetails")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Talent Detail Dialog */}
        <Dialog open={!!selectedTalent} onOpenChange={() => setSelectedTalent(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("dashboard.talents.details.title")}</DialogTitle>
              <DialogDescription>{t("dashboard.talents.details.description")}</DialogDescription>
            </DialogHeader>
            {selectedTalent && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.talents.table.name")}
                    </label>
                    <p className="text-sm mt-1">{selectedTalent.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.talents.table.email")}
                    </label>
                    <a href={`mailto:${selectedTalent.email}`} className="text-sm mt-1 text-blue-600 hover:underline block">
                      {selectedTalent.email}
                    </a>
                  </div>
                  {selectedTalent.phone_number && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {t("dashboard.talents.table.phone")}
                      </label>
                      <a href={`tel:${selectedTalent.country_code}${selectedTalent.phone_number}`} className="text-sm mt-1 text-blue-600 hover:underline flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedTalent.country_code} {selectedTalent.phone_number}
                      </a>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.talents.table.role")}
                    </label>
                    <p className="text-sm mt-1">{selectedTalent.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.talents.table.englishLevel")}
                    </label>
                    <p className="text-sm mt-1">
                      <Badge variant="outline">{selectedTalent.english_level}</Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.talents.table.appliedDate")}
                    </label>
                    <p className="text-sm mt-1">{formatDate(selectedTalent.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.talents.table.status")}
                    </label>
                    <p className="text-sm mt-1">
                      <Badge variant={selectedTalent.email_status === "sent" ? "default" : "secondary"}>
                        {selectedTalent.email_status || "pending"}
                      </Badge>
                    </p>
                  </div>
                </div>

                {selectedTalent.portfolio && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.talents.details.portfolio")}
                    </label>
                    <a
                      href={selectedTalent.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm mt-1 text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {selectedTalent.portfolio}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {selectedTalent.tools && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.talents.details.tools")}
                    </label>
                    <p className="text-sm mt-1">{selectedTalent.tools}</p>
                  </div>
                )}

                {selectedTalent.cv_url && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.talents.details.cv")}
                    </label>
                    <div className="mt-1 flex items-center gap-3">
                      <a
                        href={selectedTalent.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        {selectedTalent.cv_filename || "CV.pdf"}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.talents.details.shipped")}
                  </label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedTalent.shipped}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Company Detail Dialog */}
        <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("dashboard.companies.details.title")}</DialogTitle>
              <DialogDescription>{t("dashboard.companies.details.description")}</DialogDescription>
            </DialogHeader>
            {selectedCompany && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.companies.table.companyName")}
                    </label>
                    <p className="text-sm mt-1">{selectedCompany.company_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.companies.table.contactName")}
                    </label>
                    <p className="text-sm mt-1">{selectedCompany.contact_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.companies.table.email")}
                    </label>
                    <a href={`mailto:${selectedCompany.email}`} className="text-sm mt-1 text-blue-600 hover:underline block">
                      {selectedCompany.email}
                    </a>
                  </div>
                  {selectedCompany.phone_number && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {t("dashboard.companies.table.phone")}
                      </label>
                      <a href={`tel:${selectedCompany.country_code}${selectedCompany.phone_number}`} className="text-sm mt-1 text-blue-600 hover:underline flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedCompany.country_code} {selectedCompany.phone_number}
                      </a>
                    </div>
                  )}
                  {selectedCompany.website && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {t("dashboard.companies.details.website")}
                      </label>
                      <a
                        href={selectedCompany.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm mt-1 text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {selectedCompany.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.companies.table.companySize")}
                    </label>
                    <p className="text-sm mt-1">
                      <Badge variant="outline">{selectedCompany.company_size}</Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.companies.table.submittedDate")}
                    </label>
                    <p className="text-sm mt-1">{formatDate(selectedCompany.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.companies.table.status")}
                    </label>
                    <p className="text-sm mt-1">
                      <Badge variant={selectedCompany.email_status === "sent" ? "default" : "secondary"}>
                        {selectedCompany.email_status || "pending"}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Hiring Request Detail Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("dashboard.hiringRequests.details.title")}</DialogTitle>
              <DialogDescription>{t("dashboard.hiringRequests.details.description")}</DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{selectedRequest.request_title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedRequest.request_status === 'filled' ? 'default' : 'secondary'}>
                      {t(`dashboard.hiringRequests.status.${selectedRequest.request_status}`)}
                    </Badge>
                    <Badge variant="outline">
                      {t(`dashboard.hiringRequests.applicationStatus.${selectedRequest.application_status}`)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("dashboard.hiringRequests.details.company")}</label>
                    <p className="text-sm mt-1 font-medium">{selectedRequest.companies?.company_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedRequest.companies?.contact_name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("dashboard.hiringRequests.details.contactEmail")}</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedRequest.companies?.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("dashboard.hiringRequests.details.role")}</label>
                    <p className="text-sm mt-1">{selectedRequest.roles_needed}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("dashboard.hiringRequests.details.projectType")}</label>
                    <p className="text-sm mt-1">
                      <Badge variant="outline">{selectedRequest.project_type}</Badge>
                    </p>
                  </div>

                  {selectedRequest.budget_range && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t("dashboard.hiringRequests.details.budget")}</label>
                      <p className="text-sm mt-1">{selectedRequest.budget_range}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("dashboard.hiringRequests.details.createdDate")}</label>
                    <p className="text-sm mt-1">{formatDate(selectedRequest.created_at)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("dashboard.hiringRequests.details.projectDescription")}</label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedRequest.project_description}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Status Update Confirmation Dialog */}
        <Dialog open={statusConfirmDialog?.isOpen || false} onOpenChange={(open) => !open && setStatusConfirmDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("dashboard.status.confirm.title")}</DialogTitle>
              <DialogDescription>{t("dashboard.status.confirm.description")}</DialogDescription>
            </DialogHeader>
            {statusConfirmDialog && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">{statusConfirmDialog.type === 'talent' ? t("dashboard.talents.table.name") : t("dashboard.companies.table.companyName")}:</span>{" "}
                    {statusConfirmDialog.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{t("dashboard.status.confirm.currentStatus")}:</span>
                    <Badge variant="secondary">
                      {t(`dashboard.status.${statusConfirmDialog.type}.${
                        statusConfirmDialog.currentStatus
                          .toString()
                          .split('_')
                          .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
                          .join('')
                      }`)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{t("dashboard.status.confirm.newStatus")}:</span>
                    <Badge variant={
                      statusConfirmDialog.newStatus === 'matched' ? 'default' :
                      statusConfirmDialog.newStatus === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {t(`dashboard.status.${statusConfirmDialog.type}.${
                        statusConfirmDialog.newStatus
                          .toString()
                          .split('_')
                          .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
                          .join('')
                      }`)}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStatusConfirmDialog(null)}>
                {t("dashboard.status.confirm.cancel")}
              </Button>
              <Button onClick={confirmStatusUpdate}>
                {t("dashboard.status.confirm.confirm")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </>
  );
}
