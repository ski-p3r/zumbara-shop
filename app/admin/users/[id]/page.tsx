"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X,
} from "lucide-react";
import { getUserProfile, changeUserRole, Role } from "@/utils/api/user";

interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  image: string;
  role: keyof typeof Role;
  otpVerified: boolean;
  createdAt: string;
  updatedAt: string;
  email?: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserDetail>>({});
  const [selectedRole, setSelectedRole] = useState<keyof typeof Role>();

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      // Note: You might need to create a getSingleUser API endpoint
      // For now, using getAllUsers with ID filter or getUserProfile if it works for admin
      const userData = await getUserProfile(); // This might need adjustment
      setUser(userData);
      setSelectedRole(userData.role);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleRoleChange = async () => {
    if (!selectedRole || !user) return;

    setIsChangingRole(true);
    try {
      await changeUserRole({
        userId: user.id,
        role: selectedRole,
      });
      await fetchUser(); // Refresh user data
    } catch (error) {
      console.error("Error changing user role:", error);
    } finally {
      setIsChangingRole(false);
    }
  };

  const getRoleBadge = (role: keyof typeof Role) => {
    const roleConfig = {
      CUSTOMER: {
        variant: "secondary" as const,
        label: "Customer",
        className: "bg-gray-100 text-gray-800",
      },
      ADMIN: {
        variant: "default" as const,
        label: "Admin",
        className: "bg-blue-100 text-blue-800",
      },
      ORDER_MANAGER: {
        variant: "default" as const,
        label: "Order Manager",
        className: "bg-green-100 text-green-800",
      },
      DELIVERY: {
        variant: "outline" as const,
        label: "Delivery",
        className: "bg-orange-100 text-orange-800",
      },
    };
    const config = roleConfig[role];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
        <Button onClick={() => router.push("/admin/users")} className="mt-4">
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/users")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">User Details</h1>
            <p className="text-gray-600">User ID: {user.id}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel Edit
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image and Basic Info */}
              <div className="flex items-center gap-6">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">
                    {user.firstName} {user.lastName}
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    {getRoleBadge(user.role)}
                    {user.otpVerified ? (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        OTP Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        OTP Not Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* User Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      First Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={editedUser.firstName || user.firstName}
                        onChange={(e) =>
                          setEditedUser((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium mt-1">
                        {user.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Last Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={editedUser.lastName || user.lastName}
                        onChange={(e) =>
                          setEditedUser((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium mt-1">
                        {user.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <Input
                        value={editedUser.phone || user.phone}
                        onChange={(e) =>
                          setEditedUser((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium mt-1">{user.phone}</p>
                    )}
                  </div>

                  {user.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </label>
                      <p className="text-lg font-medium mt-1">{user.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Metadata */}
        <div className="space-y-6">
          {/* Role Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Role:</span>
                {getRoleBadge(user.role)}
              </div>

              <Separator />

              <div className="space-y-3">
                <label className="text-sm font-medium">Change Role</label>
                <Select
                  value={selectedRole}
                  onValueChange={(value: keyof typeof Role) =>
                    setSelectedRole(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="ORDER_MANAGER">Order Manager</SelectItem>
                    <SelectItem value="DELIVERY">Delivery</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleRoleChange}
                  disabled={
                    !selectedRole ||
                    selectedRole === user.role ||
                    isChangingRole
                  }
                  className="w-full"
                >
                  {isChangingRole ? "Changing..." : "Update Role"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-mono">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Created:</span>
                  <span>{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>{formatDate(user.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">OTP Status:</span>
                  <span>
                    {user.otpVerified ? (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Verified</Badge>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                View User Orders
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Send Message
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                Deactivate Account
              </Button>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
