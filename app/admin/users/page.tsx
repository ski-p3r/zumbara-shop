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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  Eye,
  MoreVertical,
  User,
  Phone,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { getAllUsers, changeUserRole, Role } from "@/utils/api/user";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  image: string;
  role: keyof typeof Role;
  otpVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [otpFilter, setOtpFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const query: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchTerm) query.search = searchTerm;
      if (roleFilter !== "all") query.role = roleFilter;
      if (otpFilter !== "all") query.otpVerified = otpFilter === "verified";

      const response: UsersResponse = await getAllUsers(query);
      setUsers(response.data);
      setPagination((prev) => ({
        ...prev,
        ...response.meta,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleOtpFilter = (value: string) => {
    setOtpFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setOtpFilter("all");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRoleChange = async (
    userId: string,
    newRole: keyof typeof Role
  ) => {
    setChangingRole(userId);
    try {
      await changeUserRole({
        userId,
        role: newRole,
      });
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error changing user role:", error);
    } finally {
      setChangingRole(null);
    }
  };

  const getRoleBadge = (role: keyof typeof Role) => {
    const roleConfig = {
      CUSTOMER: { variant: "secondary" as const, label: "Customer" },
      ADMIN: { variant: "default" as const, label: "Admin" },
      ORDER_MANAGER: { variant: "default" as const, label: "Order Manager" },
      DELIVERY: { variant: "indigo" as const, label: "Delivery" },
    };
    const config = roleConfig[role];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getOtpBadge = (verified: boolean) => {
    return verified ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <XCircle className="h-3 w-3 mr-1" />
        Not Verified
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleOptions = (userId: string, currentRole: keyof typeof Role) => {
    return Object.entries(Role)
      .filter(([_, value]) => value !== currentRole)
      .map(([key, value]) => (
        <DropdownMenuItem
          key={key}
          onClick={() => handleRoleChange(userId, value as keyof typeof Role)}
          disabled={changingRole === userId}
        >
          Change to {key.toLowerCase()}
        </DropdownMenuItem>
      ));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <Button onClick={() => fetchUsers()} variant="outline">
          Refresh
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
                    placeholder="Search by name, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={handleRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="ORDER_MANAGER">Order Manager</SelectItem>
                <SelectItem value="DELIVERY">Delivery</SelectItem>
              </SelectContent>
            </Select>

            {/* OTP Filter */}
            <Select value={otpFilter} onValueChange={handleOtpFilter}>
              <SelectTrigger>
                <SelectValue placeholder="OTP Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All OTP Status</SelectItem>
                <SelectItem value="verified">OTP Verified</SelectItem>
                <SelectItem value="not-verified">OTP Not Verified</SelectItem>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            Showing {users.length} of {pagination.total} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>OTP Status</TableHead>
                <TableHead>Joined Date</TableHead>
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
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-gray-500" />
                        {user.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        {changingRole === user.id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getOtpBadge(user.otpVerified)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={changingRole === user.id}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/users/${user.id}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigator.clipboard.writeText(user.id)
                              }
                            >
                              <User className="h-4 w-4 mr-2" />
                              Copy User ID
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigator.clipboard.writeText(user.phone)
                              }
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Copy Phone
                            </DropdownMenuItem>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="w-full">
                                <div className="flex items-center px-2 py-1.5 text-sm rounded-sm ">
                                  <Shield className="h-4 w-4 mr-2" />
                                  Change Role
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {getRoleOptions(user.id, user.role)}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
                {pagination.total} total users
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
