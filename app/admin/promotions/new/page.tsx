"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Image as ImageIcon,
  Upload,
  Loader2,
} from "lucide-react";
import { createPromotion } from "@/utils/api/promotions";
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

export default function CreatePromotionPage() {
  const router = useRouter();
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
      await createPromotion(data);
      router.push("/admin/promotions");
    } catch (error) {
      console.error("Error creating promotion:", error);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/promotions")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Promotion</h1>
          <p className="text-gray-600">Add a new promotional campaign</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Details</CardTitle>
              <CardDescription>
                Fill in the details for your new promotion
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
                      Create Promotion
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
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

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                <p>Use high-quality images for better engagement</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                <p>Keep titles short and descriptive</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                <p>Set realistic start and end dates</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                <p>Make sure the end date is after the start date</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
