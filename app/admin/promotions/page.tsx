"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Clock,
  Image,
} from "lucide-react";
import {
  getPromotions,
  deletePromotion,
  type Promotion,
  type PromotionQuery,
} from "@/utils/api/promotions";

interface PromotionsResponse {
  data: Promotion[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "startedAt" | "expiresAt" | "updatedAt" | "title"
  >("startedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const query: PromotionQuery = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      if (searchTerm) query.search = searchTerm;
      if (statusFilter !== "all") {
        if (statusFilter === "true") {
          query.active = "true";
        } else if (statusFilter === "upcoming" || statusFilter === "expired") {
          // These will be filtered client-side since the API only supports active=true
        }
      }

      const response: PromotionsResponse = await getPromotions(query);

      // Handle both array response and paginated response
      let promotionsData: Promotion[] = [];
      let metaData = null;

      if (Array.isArray(response)) {
        promotionsData = response;
        metaData = {
          total: response.length,
          page: 1,
          limit: response.length,
          totalPages: 1,
        };
      } else if (response.data && Array.isArray(response.data)) {
        promotionsData = response.data;
        metaData = response.meta;
      } else if (Array.isArray(response)) {
        promotionsData = response;
        metaData = {
          total: response.length,
          page: 1,
          limit: response.length,
          totalPages: 1,
        };
      }

      // Apply client-side filtering for status if needed
      let filteredPromotions = promotionsData;
      if (statusFilter === "upcoming") {
        filteredPromotions = promotionsData.filter((promo) => {
          const now = new Date();
          const startedAt = new Date(promo.startedAt);
          return now < startedAt;
        });
      } else if (statusFilter === "expired") {
        filteredPromotions = promotionsData.filter((promo) => {
          const now = new Date();
          const expiresAt = new Date(promo.expiresAt);
          return now > expiresAt;
        });
      }

      setPromotions(filteredPromotions);

      if (metaData) {
        setPagination((prev) => ({
          ...prev,
          ...metaData,
          total: filteredPromotions.length, // Update total based on filtered results
        }));
      } else {
        setPagination((prev) => ({
          ...prev,
          total: filteredPromotions.length,
          totalPages: Math.ceil(filteredPromotions.length / pagination.limit),
        }));
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [pagination.page, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchPromotions();
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchPromotions();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("startedAt");
    setSortOrder("desc");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDeleteClick = (promotion: Promotion) => {
    setPromotionToDelete(promotion);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promotionToDelete) return;

    setIsDeleting(true);
    try {
      await deletePromotion(promotionToDelete.id);
      await fetchPromotions(); // Refresh the list
    } catch (error) {
      console.error("Error deleting promotion:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPromotionToDelete(null);
    }
  };

  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date();
    const startedAt = new Date(promotion.startedAt);
    const expiresAt = new Date(promotion.expiresAt);

    if (now < startedAt) {
      return {
        status: "upcoming",
        label: "Upcoming",
        variant: "secondary" as const,
      };
    } else if (now > expiresAt) {
      return {
        status: "expired",
        label: "Expired",
        variant: "destructive" as const,
      };
    } else {
      return { status: "active", label: "Active", variant: "default" as const };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Promotions</h1>
          <p className="text-gray-600">Manage your promotional campaigns</p>
        </div>
        <Button onClick={() => router.push("/admin/promotions/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Promotion
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search promotions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Select
              value={sortOrder}
              onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Promotions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Promotion List</CardTitle>
          <CardDescription>
            Showing {promotions.length} of {pagination.total} promotions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promotion</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeletons
                Array.from({ length: pagination.limit }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : promotions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    No promotions found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((promotion) => {
                  const status = getPromotionStatus(promotion);
                  return (
                    <TableRow key={promotion.id} className="">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={promotion.image}
                            alt={promotion.title}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium">{promotion.title}</div>
                            <div className="text-sm text-gray-500">
                              ID: {promotion.id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="text-sm line-clamp-2">
                            {promotion.description || "No description"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          {formatDate(promotion.startedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          {formatDate(promotion.expiresAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/promotions/${promotion.id}`)
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/admin/promotions/${promotion.id}/edit`
                              )
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(promotion)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      className={
                        pagination.page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Page Numbers */}
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: pageNum,
                              }))
                            }
                            isActive={pagination.page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}

                  {pagination.totalPages > 5 &&
                    pagination.page < pagination.totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(pagination.totalPages, prev.page + 1),
                        }))
                      }
                      className={
                        pagination.page === pagination.totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              {/* Pagination Info */}
              <div className="text-center text-sm text-gray-500 mt-2">
                Page {pagination.page} of {pagination.totalPages} •{" "}
                {pagination.total} total promotions
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the promotion{" "}
              <span className="font-semibold text-red-600">
                {promotionToDelete?.title}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Promotion"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
