"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { approveProof, getProofs, rejectProof } from "@/utils/api/checkout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Proof {
  id: string;
  orderId: string;
  imageUrl: string;
  uploadedAt: string;
  order: {
    id: string;
    customerId: string;
    status: string;
    totalPrice: number;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
  };
}

export default function BankProofsPage() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogImage, setDialogImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getProofs()
      .then((data) => {
        console.log({ data });

        // If your API returns an array
        if (Array.isArray(data)) setProofs(data);
        // If your API returns { proofs: [...] }
        else setProofs(data.proofs || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string) => {
    await approveProof(id, "paid");
    toast.success(`Approved proof ${id}`);
    router.refresh();
  };

  const handleReject = async (id: string) => {
    await rejectProof(id);
    toast.success(`Rejected proof ${id}`);
    router.refresh();
  };

  const handleImageClick = (url: string) => {
    setDialogImage(url);
    setDialogOpen(true);
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Bank Transfer Proofs</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proofs.map((proof) => (
              <TableRow key={proof.id}>
                <TableCell>{proof.orderId}</TableCell>
                <TableCell>
                  <Image
                    src={proof.imageUrl}
                    alt="Proof"
                    width={60}
                    height={60}
                    className="rounded border cursor-pointer"
                    unoptimized
                    onClick={() => handleImageClick(proof.imageUrl)}
                  />
                </TableCell>
                <TableCell>
                  {new Date(proof.uploadedAt).toLocaleString()}
                </TableCell>
                <TableCell>{proof.order.status}</TableCell>
                <TableCell>{proof.order.totalPrice} ETB</TableCell>
                <TableCell>{proof.order.paymentStatus}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 text-white"
                      onClick={() => handleApprove(proof.orderId)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(proof.orderId)}
                    >
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Full screen image dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex flex-col items-center">
          {dialogImage && (
            <Image
              src={dialogImage}
              alt="Proof Full"
              width={600}
              height={600}
              className="rounded-lg"
              unoptimized
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
