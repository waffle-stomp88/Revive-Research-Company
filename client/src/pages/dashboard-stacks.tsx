import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/seo-head";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  FlaskConical,
  Users,
  Plus,
  BookMarked,
  ExternalLink,
  Trash2,
  ChevronRight,
} from "lucide-react";
import type { SavedStack } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function DashboardStacks() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: savedStacks, isLoading: savedStacksLoading } = useQuery<SavedStack[]>({
    queryKey: ["/api/saved-stacks"],
    enabled: isAuthenticated,
  });

  const deleteStackMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/saved-stacks/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-stacks"] });
      toast({ title: "Stack deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete stack", variant: "destructive" });
    },
  });

  const toggleStackVisibilityMutation = useMutation({
    mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) => {
      return apiRequest("PATCH", `/api/saved-stacks/${id}/visibility`, { isPublic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-stacks"] });
    },
    onError: () => {
      toast({ title: "Failed to update visibility", variant: "destructive" });
    },
  });

  return (
    <>
      <SEOHead title="My Stacks" description="Your saved research stacks." canonicalPath="/dashboard/stacks" />
      <main className="min-h-screen pt-32 md:pt-40 pb-24 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" data-testid="button-back-to-dashboard">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            {/* My Stacks */}
            <Card className="border-[#2a2a32]">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FlaskConical className="h-5 w-5 text-[#21d8ff]" />
                      My Stacks
                    </CardTitle>
                    <CardDescription>Research stacks you built in the stack builder</CardDescription>
                  </div>
                  <Link href="/research-stacks">
                    <Button variant="outline" size="sm" className="border-[#21d8ff]/40 text-[#21d8ff]" data-testid="button-build-stack">
                      <Plus className="h-4 w-4 mr-2" />
                      Build a Stack
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {savedStacksLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !savedStacks || savedStacks.filter(s => !s.sourceShareCode).length === 0 ? (
                  <div className="text-center py-10 space-y-3" data-testid="empty-my-stacks">
                    <FlaskConical className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm font-medium text-muted-foreground">No personal stacks yet</p>
                    <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
                      Build a custom research stack and save it to share with your research community.
                    </p>
                    <Link href="/research-stacks">
                      <Button variant="outline" size="sm" className="border-[#21d8ff]/40 text-[#21d8ff] mt-2" data-testid="button-go-build">
                        Build a Custom Stack
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3" data-testid="list-my-stacks">
                    {savedStacks.filter(s => !s.sourceShareCode).map((stack) => (
                      <div
                        key={stack.id}
                        className="flex items-center justify-between gap-3 p-4 rounded-lg border border-[#2a2a32] bg-[#0f0f12]"
                        data-testid={`row-stack-${stack.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20 flex items-center justify-center flex-shrink-0">
                            <FlaskConical className="h-4 w-4 text-[#21d8ff]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate" data-testid={`text-stack-name-${stack.id}`}>{stack.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-muted-foreground" data-testid={`text-stack-count-${stack.id}`}>{(stack.peptideNames || []).length} compound{(stack.peptideNames || []).length !== 1 ? "s" : ""}</span>
                              {(stack.synergyScore ?? 0) > 0 && (
                                <Badge variant="outline" className="text-[10px] border-[#21d8ff]/30 text-[#21d8ff]" data-testid={`badge-synergy-${stack.id}`}>
                                  {stack.synergyScore}% synergy
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${stack.isPublic ? "border-green-500/40 text-green-400" : "border-[#2a2a32] text-muted-foreground"}`}
                                data-testid={`badge-visibility-${stack.id}`}
                              >
                                {stack.isPublic ? "Public" : "Private"}
                              </Badge>
                              {stack.createdAt && (
                                <span className="text-[10px] text-muted-foreground/60">
                                  {new Date(stack.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStackVisibilityMutation.mutate({ id: stack.id, isPublic: !stack.isPublic })}
                            disabled={toggleStackVisibilityMutation.isPending}
                            className={`text-xs ${stack.isPublic ? "border-green-500/30 text-green-400" : "border-[#2a2a32] text-muted-foreground"}`}
                            data-testid={`button-toggle-visibility-${stack.id}`}
                          >
                            {stack.isPublic ? "Public" : "Private"}
                          </Button>
                          {stack.shareCode && stack.isPublic && (
                            <Link href={`/stacks/${stack.shareCode}`}>
                              <Button variant="outline" size="sm" className="border-[#2a2a32] text-muted-foreground text-xs" data-testid={`button-open-stack-${stack.id}`}>
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                Open
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-red-500/20 text-red-400 min-h-[48px] min-w-[48px]"
                            aria-label={`Delete stack "${stack.name}"`}
                            onClick={() => {
                              if (confirm(`Delete "${stack.name}"? This action cannot be undone.`)) {
                                deleteStackMutation.mutate(stack.id);
                              }
                            }}
                            disabled={deleteStackMutation.isPending}
                            data-testid={`button-delete-stack-${stack.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved from Community */}
            <Card className="border-[#2a2a32]">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#a78bfa]" />
                      Saved from Community
                    </CardTitle>
                    <CardDescription>Stacks you collected from other researchers' share pages</CardDescription>
                  </div>
                  <Link href="/research-stacks">
                    <Button variant="outline" size="sm" className="border-[#a78bfa]/40 text-[#a78bfa]" data-testid="button-browse-community">
                      <BookMarked className="h-4 w-4 mr-2" />
                      Explore Stacks
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {savedStacksLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !savedStacks || savedStacks.filter(s => !!s.sourceShareCode).length === 0 ? (
                  <div className="text-center py-10 space-y-3" data-testid="empty-community-stacks">
                    <Users className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm font-medium text-muted-foreground">No community stacks saved yet</p>
                    <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
                      Browse shared stacks from other researchers and save them to your collection.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3" data-testid="list-community-stacks">
                    {savedStacks.filter(s => !!s.sourceShareCode).map((stack) => (
                      <div
                        key={stack.id}
                        className="flex items-center justify-between gap-3 p-4 rounded-lg border border-[#2a2a32] bg-[#0f0f12]"
                        data-testid={`row-community-stack-${stack.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#a78bfa]/10 border border-[#a78bfa]/20 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-[#a78bfa]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate" data-testid={`text-community-stack-name-${stack.id}`}>{stack.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-muted-foreground" data-testid={`text-community-stack-count-${stack.id}`}>{(stack.peptideNames || []).length} compound{(stack.peptideNames || []).length !== 1 ? "s" : ""}</span>
                              {(stack.synergyScore ?? 0) > 0 && (
                                <Badge variant="outline" className="text-[10px] border-[#a78bfa]/30 text-[#a78bfa]" data-testid={`badge-community-synergy-${stack.id}`}>
                                  {stack.synergyScore}% synergy
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-[10px] border-[#a78bfa]/30 text-[#a78bfa]" data-testid={`badge-community-source-${stack.id}`}>
                                Community
                              </Badge>
                              {stack.createdAt && (
                                <span className="text-[10px] text-muted-foreground/60">
                                  Saved {new Date(stack.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {stack.sourceShareCode && (
                            <Link href={`/stacks/${stack.sourceShareCode}`}>
                              <Button variant="outline" size="sm" className="border-[#a78bfa]/30 text-[#a78bfa] text-xs" data-testid={`button-view-source-${stack.id}`}>
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                Original
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-red-500/20 text-red-400 min-h-[48px] min-w-[48px]"
                            aria-label={`Remove community stack "${stack.name}"`}
                            onClick={() => {
                              if (confirm(`Remove "${stack.name}" from your collection? This action cannot be undone.`)) {
                                deleteStackMutation.mutate(stack.id);
                              }
                            }}
                            disabled={deleteStackMutation.isPending}
                            data-testid={`button-remove-community-stack-${stack.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

export default DashboardStacks;
