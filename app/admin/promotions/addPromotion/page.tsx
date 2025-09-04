"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Save, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { Toaster, toast } from "sonner";
import { createPromotion } from "@/utils/api/promotion";
import { uploadFile } from "@/utils/api/upload"; // Import uploadFile function

export default function AddPromotionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    bannerUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Add state for file
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL for display
      setFormData({ ...formData, bannerUrl: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Client-side validation
    if (!formData.title || !formData.startDate || !formData.endDate) {
      setError("Title, Start Date, and End Date are required.");
      toast.error("Title, Start Date, and End Date are required.");
      setIsSubmitting(false);
      return;
    }

    let bannerUrl = formData.bannerUrl;
    if (selectedFile) {
      try {
        const result = await uploadFile(selectedFile);
        bannerUrl = result?.url || result?.response?.url;
        if (!bannerUrl) {
          throw new Error("Failed to upload image");
        }
      } catch (err: any) {
        const errorMessage = err.message || "Failed to upload image.";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      console.log("Sending POST request to create promotion", {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        bannerUrl,
      });

      await createPromotion({
        title: formData.title,
        description: formData.description || "",
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        bannerUrl: bannerUrl || "",
      });

      toast.success("Promotion created successfully!");
      router.push("/admin/promotions");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to create promotion. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("API error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Toaster position="top-right" richColors />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Create Promotion
            </h1>
            <p className="text-muted-foreground">
              Set up a new promotional campaign
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Basic Information */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Summer Sale 2024"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe this promotion..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="banner">Banner Image</Label>
                    <Input
                      id="banner"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {formData.bannerUrl && (
                      <div className="mt-4">
                        <img
                          src={formData.bannerUrl}
                          alt="Banner preview"
                          className="w-32 h-32 rounded-lg object-cover border"
                        />
                      </div>
                    )}
                    {!formData.bannerUrl && (
                      <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Date Range */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-transparent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate
                          ? format(formData.startDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) =>
                          date && setFormData({ ...formData, startDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-transparent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate
                          ? format(formData.endDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) =>
                          date && setFormData({ ...formData, endDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Promotion"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
