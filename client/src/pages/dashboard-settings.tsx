import { lazy, Suspense, useState } from "react";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  User,
  Lock,
  MapPin,
  Bell,
  Award,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  History,
  Monitor,
  Package,
  Sparkles,
  Mail,
  Smartphone,
  ExternalLink,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const LogbookWipeCard = lazy(() =>
  import("@/components/logbook-tab").then((m) => ({ default: m.LogbookWipeCard }))
);

function formatDate(date: Date | string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function DashboardSettings() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressEditDialogOpen, setAddressEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<{
    id: string; label: string; firstName: string; lastName: string;
    street: string; city: string; state: string; zipCode: string; country: string;
  } | null>(null);
  const [newAddressDialogOpen, setNewAddressDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "", firstName: "", lastName: "", street: "", city: "", state: "", zipCode: "", country: "United States",
  });

  const { data: savedAddresses, isLoading: addressesLoading } = useQuery<Array<{
    id: string; label: string; firstName: string; lastName: string;
    street: string; city: string; state: string; zipCode: string; country: string; isDefault: boolean;
  }>>({
    queryKey: ["/api/addresses"],
    enabled: isAuthenticated,
  });

  const { data: notificationPrefs, isLoading: prefsLoading } = useQuery<{
    id: string;
    emailOrderConfirmation: boolean | null; emailShippingUpdates: boolean | null;
    emailPromotions: boolean | null; emailNewsletter: boolean | null;
    emailAcademyUpdates: boolean | null; emailStockAlerts: boolean | null;
    smsOrderUpdates: boolean | null; smsPromotions: boolean | null;
  }>({
    queryKey: ["/api/notification-preferences"],
    enabled: isAuthenticated,
  });

  const { data: loginHistory, isLoading: loginHistoryLoading } = useQuery<Array<{
    id: string; ipAddress: string | null; userAgent: string | null; loginAt: string;
  }>>({
    queryKey: ["/api/login-history"],
    enabled: isAuthenticated,
  });

  const { data: affiliate } = useQuery<{ id: string } | null>({
    queryKey: ["/api/affiliate/me"],
    enabled: isAuthenticated,
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/addresses/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({ title: "Address Deleted", description: "Your address has been removed." });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete address. Please try again.", variant: "destructive" }),
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("POST", `/api/addresses/${id}/default`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({ title: "Default Address Set", description: "Your default address has been updated." });
    },
    onError: () => toast({ title: "Error", description: "Failed to set default address. Please try again.", variant: "destructive" }),
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (data: { id: string; label: string; firstName: string; lastName: string; street: string; city: string; state: string; zipCode: string; country: string }) =>
      apiRequest("PATCH", `/api/addresses/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({ title: "Address Updated", description: "Your address has been updated." });
      setAddressEditDialogOpen(false);
      setEditingAddress(null);
    },
    onError: () => toast({ title: "Error", description: "Failed to update address. Please try again.", variant: "destructive" }),
  });

  const createAddressMutation = useMutation({
    mutationFn: async (data: { label: string; firstName: string; lastName: string; street: string; city: string; state: string; zipCode: string; country: string }) =>
      apiRequest("POST", "/api/addresses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({ title: "Address Added", description: "Your new address has been saved." });
      setNewAddressDialogOpen(false);
      setNewAddress({ label: "", firstName: "", lastName: "", street: "", city: "", state: "", zipCode: "", country: "United States" });
    },
    onError: () => toast({ title: "Error", description: "Failed to add address. Please try again.", variant: "destructive" }),
  });

  const updateNotificationPrefsMutation = useMutation({
    mutationFn: async (data: Partial<{ emailOrderConfirmation: boolean; emailShippingUpdates: boolean; emailPromotions: boolean; emailNewsletter: boolean; emailAcademyUpdates: boolean; emailStockAlerts: boolean; smsOrderUpdates: boolean; smsPromotions: boolean }>) =>
      apiRequest("PATCH", "/api/notification-preferences", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
      toast({ title: "Preferences Updated", description: "Your notification settings have been saved." });
    },
    onError: () => toast({ title: "Error", description: "Failed to update preferences. Please try again.", variant: "destructive" }),
  });

  return (
    <>
      <SEOHead title="Settings" description="Manage your profile, addresses, and notification preferences." canonicalPath="/dashboard/settings" />
      <main className="min-h-screen pt-32 md:pt-40 pb-24 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground px-2 h-8" data-testid="button-back-to-dashboard">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Dashboard
                </Button>
              </Link>
              <span className="text-muted-foreground/40 select-none">/</span>
              <span className="text-sm font-medium text-foreground" aria-current="page">Settings</span>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Information */}
              <Card className="border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 via-transparent to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#21d8ff]/20">
                      <User className="h-5 w-5 text-[#21d8ff]" />
                    </div>
                    <span>Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <User className="h-3 w-3" />
                        Name
                      </div>
                      <div className="font-medium">
                        {user?.firstName || user?.lastName
                          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                          : "Not set"}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" />
                        Email
                      </div>
                      <div className="font-medium">{user?.email || "Not set"}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Member Since
                      </div>
                      <div className="font-medium">{formatDate(user?.createdAt || new Date())}</div>
                    </div>
                  </div>
                  <Link href="/account-settings">
                    <Button className="w-full bg-[#D4FF1F] text-black" data-testid="button-account-settings">
                      Edit Profile
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Security & Login Activity */}
              <Card className="border-[#f97316]/20 bg-gradient-to-br from-[#f97316]/5 via-transparent to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#f97316]/20">
                      <Lock className="h-5 w-5 text-[#f97316]" />
                    </div>
                    <span>Security &amp; Login Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Password &amp; Auth</p>
                          <p className="text-xs text-muted-foreground">Managed securely by Auth0</p>
                        </div>
                      </div>
                      <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">Auth0</Badge>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Recent Login Activity
                      </p>
                      {loginHistoryLoading ? (
                        <div className="space-y-2">
                          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                      ) : loginHistory && loginHistory.length > 0 ? (
                        <div className="space-y-2">
                          {loginHistory.slice(0, 3).map((login, idx) => (
                            <div key={login.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 text-sm" data-testid={`login-${login.id}`}>
                              <Monitor className="h-4 w-4 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-xs text-muted-foreground">
                                  {login.userAgent?.split(" ").slice(0, 3).join(" ") || "Unknown device"}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0">{formatDate(login.loginAt)}</span>
                              {idx === 0 && <Badge className="bg-green-500/10 text-green-500 border-green-500/30 text-xs">Current</Badge>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No login history available</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Affiliate Status */}
              <Card className="border-[#9d4edd]/20 bg-gradient-to-br from-[#9d4edd]/5 via-transparent to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#9d4edd]/20">
                      <Award className="h-5 w-5 text-[#9d4edd]" />
                    </div>
                    <span>Affiliate Program</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {affiliate?.id ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/40">
                        <div className="p-2 rounded-full bg-green-500/20">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <span className="text-green-400 font-semibold">Active Affiliate</span>
                          <p className="text-xs text-muted-foreground">Earning commissions on referrals</p>
                        </div>
                      </div>
                      <Link href="/affiliate/dashboard">
                        <Button variant="outline" className="w-full border-[#9d4edd]/40" data-testid="button-affiliate-dashboard">
                          View Dashboard
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-[#9d4edd]/20 bg-[#9d4edd]/5">
                        <p className="text-sm text-muted-foreground flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-[#9d4edd] shrink-0 mt-0.5" />
                          Join our affiliate program and earn commissions on referrals. Get 10% on every sale!
                        </p>
                      </div>
                      <Link href="/affiliate">
                        <Button className="w-full bg-gradient-to-r from-[#9d4edd] to-[#9d4edd]/80 text-white" data-testid="button-join-affiliate">
                          Join Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Saved Addresses */}
              <Card className="border-[#D4FF1F]/20 bg-gradient-to-br from-[#D4FF1F]/5 via-transparent to-transparent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#D4FF1F]/20">
                        <MapPin className="h-5 w-5 text-[#D4FF1F]" />
                      </div>
                      <span>Saved Addresses</span>
                    </CardTitle>
                    <Button size="sm" variant="outline" className="border-[#D4FF1F]/40" onClick={() => setNewAddressDialogOpen(true)} data-testid="button-add-address">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {addressesLoading ? (
                    <div className="space-y-2">
                      {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                  ) : savedAddresses && savedAddresses.length > 0 ? (
                    <div className="space-y-3">
                      {savedAddresses.map((addr) => (
                        <div key={addr.id} className="p-4 rounded-lg border border-[#D4FF1F]/20 bg-[#D4FF1F]/5 flex items-start justify-between gap-3 group" data-testid={`address-${addr.id}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{addr.label || "Address"}</p>
                              {addr.isDefault && (
                                <Badge className="bg-[#D4FF1F]/10 text-[#D4FF1F] border-[#D4FF1F]/30 text-xs">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{addr.firstName} {addr.lastName}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!addr.isDefault && (
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={setDefaultAddressMutation.isPending}
                                onClick={() => setDefaultAddressMutation.mutate(addr.id)}
                                data-testid={`button-set-default-${addr.id}`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingAddress({
                                  id: addr.id, label: addr.label, firstName: addr.firstName,
                                  lastName: addr.lastName, street: addr.street, city: addr.city,
                                  state: addr.state, zipCode: addr.zipCode, country: addr.country,
                                });
                                setAddressEditDialogOpen(true);
                              }}
                              data-testid={`button-edit-address-${addr.id}`}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              disabled={deleteAddressMutation.isPending}
                              onClick={() => deleteAddressMutation.mutate(addr.id)}
                              data-testid={`button-delete-address-${addr.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <MapPin className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">No saved addresses</p>
                      <Button size="sm" variant="outline" onClick={() => setNewAddressDialogOpen(true)} data-testid="button-add-first-address">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Address
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card className="border-[#ec4899]/20 bg-gradient-to-br from-[#ec4899]/5 via-transparent to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#ec4899]/20">
                      <Bell className="h-5 w-5 text-[#ec4899]" />
                    </div>
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {prefsLoading ? (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : notificationPrefs ? (
                    <div className="space-y-4">
                      {[
                        { key: "emailShippingUpdates" as const, label: "Order Updates", desc: "Shipping and delivery notifications", Icon: Package },
                        { key: "emailPromotions" as const, label: "Promotions", desc: "Deals and special offers", Icon: Sparkles },
                        { key: "emailNewsletter" as const, label: "Newsletter", desc: "Research updates and news", Icon: Mail },
                        { key: "smsOrderUpdates" as const, label: "SMS Alerts", desc: "Text message notifications", Icon: Smartphone },
                      ].map(({ key, label, desc, Icon }) => (
                        <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={notificationPrefs[key] ? "default" : "outline"}
                            disabled={updateNotificationPrefsMutation.isPending}
                            onClick={() => updateNotificationPrefsMutation.mutate({ [key]: !notificationPrefs[key] })}
                            data-testid={`toggle-${key}`}
                          >
                            {updateNotificationPrefsMutation.isPending ? "..." : notificationPrefs[key] ? "On" : "Off"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Loading preferences...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Danger Zone — Full Width */}
          <div className="mt-6">
            <Card className="border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={null}><LogbookWipeCard /></Suspense>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data.
                </p>
                <Button
                  variant="outline"
                  className="border-red-500/50 text-red-500"
                  onClick={() => setDeleteDialogOpen(true)}
                  data-testid="button-delete-account"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data including orders and preferences will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} data-testid="button-cancel-delete">
              Cancel
            </Button>
            <Link href="/account-settings">
              <Button variant="destructive" data-testid="button-confirm-delete">
                Continue to Delete
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Address Dialog */}
      <Dialog open={newAddressDialogOpen} onOpenChange={(open) => {
        setNewAddressDialogOpen(open);
        if (!open) setNewAddress({ label: "", firstName: "", lastName: "", street: "", city: "", state: "", zipCode: "", country: "United States" });
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>Save a new shipping address to your account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Label</label>
              <Input value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} placeholder="e.g., Home, Lab, Work" data-testid="input-new-address-label" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input value={newAddress.firstName} onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })} placeholder="First name" data-testid="input-new-address-firstname" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input value={newAddress.lastName} onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })} placeholder="Last name" data-testid="input-new-address-lastname" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Street Address</label>
              <Input value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} placeholder="123 Main St" data-testid="input-new-address-street" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} placeholder="City" data-testid="input-new-address-city" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} placeholder="State" data-testid="input-new-address-state" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">ZIP Code</label>
                <Input value={newAddress.zipCode} onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })} placeholder="ZIP" data-testid="input-new-address-zipcode" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} data-testid="input-new-address-country" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setNewAddressDialogOpen(false)} data-testid="button-cancel-new-address">Cancel</Button>
            <Button
              onClick={() => createAddressMutation.mutate(newAddress)}
              disabled={createAddressMutation.isPending || !newAddress.firstName || !newAddress.lastName || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode}
              data-testid="button-save-new-address"
            >
              {createAddressMutation.isPending ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Address Edit Dialog */}
      <Dialog open={addressEditDialogOpen} onOpenChange={(open) => {
        setAddressEditDialogOpen(open);
        if (!open) setEditingAddress(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>Update your address details.</DialogDescription>
          </DialogHeader>
          {editingAddress && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Label</label>
                <Input value={editingAddress.label} onChange={(e) => setEditingAddress({ ...editingAddress, label: e.target.value })} placeholder="e.g., Home, Work" data-testid="input-address-label" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input value={editingAddress.firstName} onChange={(e) => setEditingAddress({ ...editingAddress, firstName: e.target.value })} data-testid="input-address-firstname" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input value={editingAddress.lastName} onChange={(e) => setEditingAddress({ ...editingAddress, lastName: e.target.value })} data-testid="input-address-lastname" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Street Address</label>
                <Input value={editingAddress.street} onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })} data-testid="input-address-street" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input value={editingAddress.city} onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })} data-testid="input-address-city" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input value={editingAddress.state} onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })} data-testid="input-address-state" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ZIP Code</label>
                  <Input value={editingAddress.zipCode} onChange={(e) => setEditingAddress({ ...editingAddress, zipCode: e.target.value })} data-testid="input-address-zipcode" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Input value={editingAddress.country} onChange={(e) => setEditingAddress({ ...editingAddress, country: e.target.value })} data-testid="input-address-country" />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAddressEditDialogOpen(false)} data-testid="button-cancel-address-edit">Cancel</Button>
            <Button
              onClick={() => editingAddress && updateAddressMutation.mutate(editingAddress)}
              disabled={updateAddressMutation.isPending || !editingAddress?.firstName || !editingAddress?.lastName || !editingAddress?.street || !editingAddress?.city || !editingAddress?.state || !editingAddress?.zipCode}
              data-testid="button-save-address"
            >
              {updateAddressMutation.isPending ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DashboardSettings;
