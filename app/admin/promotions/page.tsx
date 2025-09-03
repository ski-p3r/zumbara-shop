"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Tag, Percent, Calendar } from "lucide-react";

import { Toaster, toast } from "sonner";
import { getPromotions } from "@/utils/api/promotion"; // Import getPromotions
import axiosInstance from "@/utils/axios"; // Use axiosInstance for delete requests

interface Promotion {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  bannerUrl: string;
  code?: string;
  type?: string;
  value?: string | number;
  isActive?: boolean;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch promotions on mount
  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPromotions(); // Use getPromotions from promotion.ts
        console.log("Fetched promotions:", data);
        // Map backend response to frontend format
        const mappedPromotions = data.map((promo: any) => ({
          id: promo.id,
          name: promo.title, // Map title to name
          description: promo.description,
          startDate: promo.startDate,
          endDate: promo.endDate,
          bannerUrl: promo.bannerUrl,
          code: promo.code || "N/A", // Placeholder for missing field
          type: promo.type || "N/A", // Placeholder for missing field
          value: promo.value || "-", // Placeholder for missing field
          isActive: promo.isActive ?? (
            new Date(promo.startDate) <= new Date() &&
            new Date() <= new Date(promo.endDate)
          ),
        }));
        setPromotions(mappedPromotions);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Failed to fetch promotions.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  // Delete promotion
  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/promotion/${id}`); // Use axiosInstance for delete
      toast.success("Promotion deleted successfully!");
      // Refetch promotions to update UI
      const data = await getPromotions(); // Refetch promotions
      const mappedPromotions = data.map((promo: any) => ({
        id: promo.id,
        name: promo.title,
        description: promo.description,
        startDate: promo.startDate,
        endDate: promo.endDate,
        bannerUrl: promo.bannerUrl,
        code: promo.code || "N/A",
        type: promo.type || "N/A",
        value: promo.value || "-",
        isActive: promo.isActive ?? (
          new Date(promo.startDate) <= new Date() &&
          new Date() <= new Date(promo.endDate)
        ),
      }));
      setPromotions(mappedPromotions);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to delete promotion.";
      toast.error(errorMessage);
      console.error("Delete error:", err);
    }
  };

  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()));
      const now = new Date();
      const isExpired = new Date(p.endDate) < now;
      const isUpcoming = new Date(p.startDate) > now;
      const status = isExpired ? "expired" : isUpcoming ? "upcoming" : p.isActive ? "active" : "inactive";
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [promotions, searchTerm, statusFilter]);

  const totals = useMemo(() => {
    const now = new Date();
    const active = promotions.filter(
      (p) => p.isActive && new Date(p.startDate) <= now && now <= new Date(p.endDate)
    ).length;
    const expired = promotions.filter((p) => new Date(p.endDate) < now).length;
    const upcoming = promotions.filter((p) => new Date(p.startDate) > now).length;
    return { total: promotions.length, active, expired, upcoming };
  }, [promotions]);

  if (loading) {
    return <p className="text-center py-20">Loading promotions...</p>;
  }

  if (error) {
    return <p className="text-center py-20 text-red-500">{error}</p>;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Toaster position="top-right" richColors />
      <div className=" px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Promotions & Discounts</h1>
            <p className="text-muted-foreground">Manage promotional campaigns and discount codes</p>
          </div>
          
            <Button asChild>
              <Link href="promotions/addPromotion">
                <Plus className="mr-2 h-4 w-4" />
                Create Promotion
              </Link>
            </Button>
         
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Stats cards remain unchanged */}
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Promotions</CardTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search promotions..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.map((promo) => {
                  const now = new Date();
                  const isExpired = new Date(promo.endDate) < now;
                  const isUpcoming = new Date(promo.startDate) > now;
                  const status = isExpired ? "expired" : isUpcoming ? "upcoming" : promo.isActive ? "active" : "inactive";
                  return (
                    <TableRow key={promo.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{promo.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={status === "active" ? "default" : status === "upcoming" ? "secondary" : "destructive"}
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(promo.startDate).toLocaleDateString()} -{" "}
                        {new Date(promo.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            
                              <DropdownMenuItem asChild>
                                <Link href={`promotions/${promo.id}/editPromotion`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(promo.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}