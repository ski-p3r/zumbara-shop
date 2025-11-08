"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Image as ImageIcon,
  Upload,
  Loader2,
} from "lucide-react";
import { getPromotion, updatePromotion } from "@/utils/api/promotions";
import { uploadFile } from "@/utils/api/upload";

// Schema validation
const promotionFormSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    description: z.string().max(500, "Description is too long").optional(),
    image: z.string().min(1, "Image is required"),
    startedAt: z.string().min(1, "Start date is required"),
    expiresAt: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => {
      const startedAt = new Date(data.startedAt);
      const expiresAt = new Date(data.expiresAt);
      return expiresAt > startedAt;
    },
    {
      message: "End date must be after start date",
      path: ["expiresAt"],
    }
  );

type PromotionFormValues = z.infer<typeof promotionFormSchema>;

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const promotionId = params.id as string;

  const [promotion, setPromotion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      startedAt: "",
      expiresAt: "",
    },
  });

  const imageUrl = form.watch("image");

  // Fetch promotion data
  useEffect(() => {
    const fetchPromotion = async () => {
      setIsLoading(true);
      try {
        const promotionData = await getPromotion(promotionId);
        setPromotion(promotionData);

        // Set form values
        form.reset({
          title: promotionData.title,
          description: promotionData.description || "",
          image: promotionData.image,
          startedAt: promotionData.startedAt.split(".")[0], // Remove milliseconds for datetime-local
          expiresAt: promotionData.expiresAt.split(".")[0], // Remove milliseconds for datetime-local
        });
      } catch (error) {
        console.error("Error fetching promotion:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (promotionId) {
      fetchPromotion();
    }
  }, [promotionId, form]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadResult = await uploadFile(file);
      const imageUrl =
        uploadResult.url || uploadResult.data?.url || uploadResult.imageUrl;

      if (imageUrl) {
        form.setValue("image", imageUrl);
      } else {
        console.error("No image URL in response:", uploadResult);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const onSubmit = async (data: PromotionFormValues) => {
    setIsSubmitting(true);
    try {
      await updatePromotion(promotionId, data);
      router.push("/admin/promotions");
    } catch (error) {
      console.error("Error updating promotion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPromotionStatus = () => {
    if (!promotion) return null;

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

  const getMinEndDate = () => {
    const startDate = form.watch("startedAt");
    if (startDate) {
      const minDate = new Date(startDate);
      minDate.setDate(minDate.getDate() + 1);
      return minDate.toISOString().split("T")[0];
    }
    return "";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Promotion not found
        </h1>
        <Button
          onClick={() => router.push("/admin/promotions")}
          className="mt-4"
        >
          Back to Promotions
        </Button>
      </div>
    );
  }

  const status = getPromotionStatus();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/promotions")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Promotion</h1>
            <p className="text-gray-600">Update promotion details</p>
          </div>
        </div>
        {status && <Badge variant={status.variant}>{status.label}</Badge>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Details</CardTitle>
              <CardDescription>
                Update the details for your promotion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter promotion title"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A catchy title that describes your promotion
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter promotion description"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about your promotion (max 500
                          characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Upload */}
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Image</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                              />
                              {isUploading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                            </div>

                            {/* Image Preview */}
                            {imageUrl && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600 mb-2">
                                  Image Preview:
                                </p>
                                <img
                                  src={imageUrl}
                                  alt="Promotion preview"
                                  className="w-32 h-32 object-cover rounded-lg border"
                                />
                              </div>
                            )}

                            <Input
                              placeholder="Or enter image URL directly"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload an eye-catching image for your promotion
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="startedAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Start Date
                          </FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            End Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              min={getMinEndDate()}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/admin/promotions")}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update Promotion
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Info */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your promotion will appear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Promotion preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg">
                    {form.watch("title") || "Promotion Title"}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {form.watch("description") ||
                      "Promotion description will appear here..."}
                  </p>
                </div>

                {(form.watch("startedAt") || form.watch("expiresAt")) && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {form.watch("startedAt") && (
                      <div>
                        Starts:{" "}
                        {new Date(form.watch("startedAt")).toLocaleString()}
                      </div>
                    )}
                    {form.watch("expiresAt") && (
                      <div>
                        Ends:{" "}
                        {new Date(form.watch("expiresAt")).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Promotion Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Promotion Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>
                  {new Date(promotion.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>
                  {new Date(promotion.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Promotion ID:</span>
                <span className="font-mono text-xs">{promotion.id}</span>
              </div>
              {status && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <Badge variant={status.variant} className="text-xs">
                    {status.label}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Editing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                <p>Updating dates will affect promotion visibility</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                <p>Changes take effect immediately after saving</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                <p>Ensure end date is always after start date</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
