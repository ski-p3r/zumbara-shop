import axiosInstance from "../axios";

export const getPaymentMethods = async () => {
  try {
    const response = await axiosInstance.get("/payments/methods");
    // Expecting response.data to contain { methods: [...] } or an array
    return response.data;
  } catch (error: any) {
    // Fallback to hardcoded methods if backend endpoint is not available
    if (
      error?.response == null ||
      error?.response?.status === 404 ||
      error?.response?.status === 501
    ) {
      return {
        methods: [
          {
            bankName: "CBE",
            accountName: "Abel G/Senbet",
            accountNumber: "1000504447581",
          },
          {
            bankName: "Abysinia",
            accountName: "Abel G/Senbet",
            accountNumber: "41289279",
          },
          {
            bankName: "Awash",
            accountName: "Abel G/Senbet",
            accountNumber: "013201216506200",
          },
          {
            bankName: "TeleBirr",
            accountName: "Abel G/Senbet",
            accountNumber: "0905561888",
          },
        ],
      };
    }

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch payment methods";
    throw new Error(message);
  }
};
