"use server";

import axiosInstance from "../axios";

export const getPaymentMethods = async () => {
  try {
    // const response = await axiosInstance.get("/payments/methods");
    // return response.data.methods;
    return {
      methods: [
        {
          bankName: "CBE",
          accountName: "My Store",
          accountNumber: "100012345678",
        },
        {
          bankName: "TeleBirr",
          accountName: "My Store",
          accountNumber: "0912345678",
        },
      ],
    };
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch payment methods"
    );
  }
};
