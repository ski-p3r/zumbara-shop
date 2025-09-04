"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/providers/language-provider";
import { getTheUser, updateProfile, changePassword } from "@/utils/api/user";
import { uploadFile } from "@/utils/api/upload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Camera, Upload, Save, Lock } from "lucide-react";
import { clearAllCookies } from "@/utils/store";

// Utility function to capitalize the first letter of a string
const capitalize = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function ProfilePage() {
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    status: "",
    address: "",
    language: "en",
    profileImage: "",
  });
  const [showEmail, setShowEmail] = useState(true);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState("");
  const [originalProfileImage, setOriginalProfileImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await getTheUser();
        const userData = response?.data?.user || response?.data || response;
        if (userData) {
          setUser({ ...userData });
          setProfileImage(userData.profileImage || "");
          setOriginalProfileImage(userData.profileImage || "");
        }
      } catch {
        toast.error(t("profile.errorFetchUserData"));
      }
    })();
  }, [t]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Selected file:", e.target.files?.[0]);
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const handleSaveProfileImage = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    try {
      const result = await uploadFile(selectedFile);
      const url = result?.url || result?.response?.url;
      if (url) {
        await updateProfile({ profileImage: url });
        setUser((prev) => ({ ...prev, profileImage: url }));
        setOriginalProfileImage(url);
        setSelectedFile(null);
        toast.success(t("profile.profilePictureUpdated"));
      } else {
        throw new Error("Upload did not return a URL");
      }
    } catch {
      toast.error(t("profile.profilePictureUpdateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("profile.passwordsDoNotMatch"));
      return;
    }
    setIsSaving(true);
    try {
      await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success(t("profile.passwordChangedSuccess"));
      setShowPasswordFields(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error?.message || t("profile.passwordChangeFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const initials = `${user.firstName[0] || ""}${user.lastName[0] || ""}`;

  const languages = [
    { code: "en", label: t("lang.en") },
    { code: "am", label: t("lang.am") },
    { code: "ar", label: t("lang.ar") },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Sidebar/Profile Card */}
        <Card className="w-full md:w-1/3 rounded-3xl shadow-xl border-0 bg-white/90 dark:bg-zinc-900/90 flex flex-col items-center ">
          <div className="relative group mb-4">
            <Avatar className="h-36 w-36 border-4 border-primary shadow-lg">
              <AvatarImage
                src={profileImage || "/placeholder.svg"}
                alt={user.firstName + " " + user.lastName}
              />
              <AvatarFallback className="text-3xl bg-muted">
                {initials.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute bottom-3 right-3 bg-primary p-2 rounded-full shadow-lg hover:bg-primary/80 transition"
              onClick={() => fileInputRef.current?.click()}
              title={t("profile.changePhoto")}
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          {profileImage !== originalProfileImage && selectedFile && (
            <Button
              className="rounded-full px-8 py-2 font-bold mb-2"
              onClick={handleSaveProfileImage}
              disabled={isSaving}
            >
              {isSaving ? t("profile.saving") : t("profile.save")}
            </Button>
          )}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">
            {showEmail ? user.email : "••••••••••••••••"}
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-2">
            {user.phone}
          </p>
          <div className="flex gap-2 mt-2 justify-center mb-4">
            <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
              {user.role}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
              {capitalize(user.status)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-muted-foreground">
              {t("profile.showEmail")}
            </span>
            <input
              type="checkbox"
              checked={showEmail}
              onChange={() => setShowEmail((v) => !v)}
              className="accent-primary w-5 h-5 rounded"
            />
          </div>
        </Card>
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-8">
          <Card className="rounded-3xl shadow-xl border-0 bg-white/90 dark:bg-zinc-900/90 p-8">
            <h3 className="text-xl font-bold mb-6">
              {t("profile.personalInfo")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="address">{t("profile.address")}</Label>
                <Input
                  id="address"
                  value={user.address}
                  disabled
                  className="bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">{t("profile.language")}</Label>
                <select
                  id="language"
                  value={user.language}
                  onChange={(e) => {
                    setLanguage(e.target.value as any);
                  }}
                  className="w-full px-3 py-2 border border-border bg-card rounded-md text-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
          <Card className="rounded-3xl shadow-xl border-0 bg-white/90 dark:bg-zinc-900/90 p-8">
            <h3 className="text-xl font-bold mb-6">{t("profile.security")}</h3>
            <Button
              variant="outline"
              className="w-full py-3 rounded-full font-bold flex items-center gap-2 mb-4"
              onClick={() => setShowPasswordFields((v) => !v)}
            >
              <Lock className="h-5 w-5 text-destructive" />
              {t("profile.changePassword")}
            </Button>
            {showPasswordFields && (
              <div className="space-y-3 mb-4">
                <div>
                  <Label htmlFor="oldPassword">
                    {t("profile.currentPassword")}
                  </Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        oldPassword: e.target.value,
                      }))
                    }
                    className="bg-card"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">
                    {t("profile.newPassword")}
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="bg-card"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">
                    {t("profile.confirmPassword")}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="bg-card"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleChangePassword}
                    disabled={isSaving}
                    className="bg-destructive hover:bg-destructive/90 text-white"
                  >
                    {isSaving ? t("profile.saving") : t("profile.change")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordFields(false);
                      setPasswordData({
                        oldPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    {t("profile.cancel")}
                  </Button>
                </div>
              </div>
            )}
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-full"
              onClick={async () => {
                await clearAllCookies();
                router.push("/login");
                toast.success(t("profile.logoutSuccess"));
              }}
            >
              {t("profile.logout")}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
