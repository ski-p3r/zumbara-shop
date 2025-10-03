"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { uploadFile } from "@/utils/api/upload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadProof } from "@/utils/api/checkout";

interface PaymentMethod {
  name: string;
  account: string;
  accountName: string;
  image: string;
}

export default function BankTransferPage() {
  const { t } = useLanguage();
  const [total, setTotal] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    setOrderId(localStorage.getItem("orderId"));
    setTotal(localStorage.getItem("total"));
  }, []);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://test.zumbarashop.com/api/v1/payment/methods")
      .then((res) => res.json())
      .then((data) => setMethods(data.methods || []))
      .finally(() => setLoading(false));
  }, []);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!url) {
      toast.error("Please upload a screenshot");
      return;
    }

    const formData = {
      orderId,
      total,
      imageUrl: url,
    };

    try {
      await uploadProof({ orderId: orderId!, imageUrl: url! });
      toast.success("Proof of payment uploaded successfully");
      localStorage.removeItem("orderId");
      localStorage.removeItem("total");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload proof of payment");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      let imageUrl;
      if (selectedFile) {
        try {
          const result = await uploadFile(selectedFile);
          imageUrl = result?.url || result?.response?.url;
          setUrl(imageUrl);
          if (!imageUrl) {
            throw new Error("Failed to upload image");
          }
        } catch (err: any) {
          toast.error(err.message || "Image upload failed");
        }
      }
    }
  };

  return (
    <Card className="max-w-xl w-full rounded-3xl shadow-2xl border-0">
      <CardContent className="p-10 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2 text-blue-700 dark:text-blue-300">
          {t("checkout.bankTransfer")}
        </h1>
        <p className="mb-6 text-center text-muted-foreground">
          {t("checkout.bankTransferInfo")}
        </p>
        <div className="mb-4">
          <span className="font-semibold">Order ID:</span> {orderId}
          <br />
          <span className="font-semibold">Total Amount:</span> ETB {total}
        </div>
        {loading ? (
          <div className="my-8 text-center text-muted-foreground">
            Loading payment methods...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
            {methods.map((method) => (
              <div
                key={method.name}
                className="flex flex-col items-center bg-white dark:bg-zinc-900 rounded-xl p-4 shadow border border-blue-100 dark:border-blue-900"
              >
                <div className="font-semibold text-lg mb-1 text-blue-700 dark:text-blue-300">
                  {method.name}
                </div>
                <div className="text-sm mb-1">
                  <span className="font-semibold">Account:</span>{" "}
                  {method.account}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Name:</span>{" "}
                  {method.accountName}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 mb-6">
          <Label htmlFor="image">Upload ScreenShot</Label>
          <div className="flex items-center space-x-4">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          {url && (
            <img
              src={url}
              alt="Uploaded Screenshot"
              className="w-32 h-32 rounded-lg object-cover border"
            />
          )}

          <div className="mt-4">
            <Button disabled={!url} onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground text-center">
          After transferring, please contact support with your order ID for
          confirmation.
        </div>
      </CardContent>
    </Card>
  );
}
