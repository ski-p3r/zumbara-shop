"use client";

import { useEffect, useState } from "react";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "@/utils/api/user";
import { uploadFile } from "@/utils/api/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Edit2, Lock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ProfilePage() {
  const [tab, setTab] = useState<"overview" | "settings">("overview");

  const [profile, setProfile] = useState<{
    firstName?: string;
    lastName?: string;
    image?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    const data = await getUserProfile();
    setProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      image: data.image,
    });
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setUpdateLoading(true);
    await updateUserProfile({
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      image: profile?.image,
    });
    setUpdateLoading(false);
    setEditMode(false);
    loadProfile();
  };

  const handleUploadImage = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { url } = await uploadFile(file);
    setProfile((p: any) => ({ ...p, image: url }));
    await updateUserProfile({ image: url });
    await loadProfile();
    toast.success("Profile image updated successfully");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    await changeUserPassword(passwordData);
    setPasswordLoading(false);
    setPasswordData({ oldPassword: "", newPassword: "" });
    toast.success("Password changed successfully");
  };

  if (loading)
    return (
      <div className="p-6 text-center">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-8">My Account</h1>

      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-10">
        <div>
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile?.image || ""} />
            <AvatarFallback>
              {profile?.firstName?.[0]}
              {profile?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <label className="text-sm underline cursor-pointer mt-2 inline-block">
            <input
              type="file"
              className="hidden"
              onChange={handleUploadImage}
            />
            Change Photo
          </label>
        </div>

        <div className="flex-1">
          <p className="text-xl font-semibold">
            {profile?.firstName} {profile?.lastName}
          </p>

          <Button
            variant="ghost"
            size="sm"
            className="mt-4 px-0 gap-2"
            onClick={() => setEditMode(true)}
          >
            <Edit2 className="w-4 h-4" /> Edit Profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 text-sm font-medium mb-8">
        <button
          onClick={() => setTab("overview")}
          className={tab === "overview" ? "text-primary" : ""}
        >
          Profile Details
        </button>
        <button
          onClick={() => setTab("settings")}
          className={tab === "settings" ? "text-primary" : ""}
        >
          Security
        </button>
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-5">
          <div>
            <p className="text-sm text-gray-500">First Name</p>
            <p className="font-medium">{profile?.firstName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Name</p>
            <p className="font-medium">{profile?.lastName}</p>
          </div>
        </div>
      )}

      {/* Security */}
      {tab === "settings" && (
        <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
          <div>
            <p className="text-sm text-gray-600 mb-1">Old Password</p>
            <Input
              type="password"
              value={passwordData.oldPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  oldPassword: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">New Password</p>
            <Input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              required
            />
          </div>

          <Button disabled={passwordLoading} className="w-full">
            {passwordLoading ? (
              <Loader className="animate-spin w-4 h-4" />
            ) : (
              <>
                <Lock className="w-4 h-4" /> Change Password
              </>
            )}
          </Button>
        </form>
      )}

      {/* Edit Profile Modal */}
      <Dialog open={editMode} onOpenChange={setEditMode}>
        <DialogContent className="p-6 max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Edit Profile
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              placeholder="First Name"
              value={profile?.firstName}
              onChange={(e) =>
                setProfile({ ...profile, firstName: e.target.value })
              }
            />

            <Input
              placeholder="Last Name"
              value={profile?.lastName}
              onChange={(e) =>
                setProfile({ ...profile, lastName: e.target.value })
              }
            />

            <DialogFooter className="flex gap-3 pt-2">
              <Button className="flex-1" disabled={updateLoading}>
                {updateLoading ? (
                  <Loader className="animate-spin w-4 h-4" />
                ) : (
                  "Save"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
