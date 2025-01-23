import { useAppStore } from "@/store";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { EmptyState } from "../shared/EmptyState";
import { InfiniteScroll } from "../shared/InfiniteScroll";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { API_URLS } from "@/constants/api_urls";
import makeApiCall from "@/lib/api_wrapper";
import { IndianRupeeIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

export default function PaymentsTab() {
  const { payments, getRoomPaymentsData, tab_loading, reached_end, selectedRoom, getRoomFeedData, user, createPayment } = useAppStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentName, setPaymentName] = useState<string | undefined>(undefined);
  const [paymentDescription, setPaymentDescription] = useState<string | undefined>(undefined);
  const [paymentAmount, setPaymentAmount] = useState<string | undefined>(undefined);

  useEffect(() => {
    getRoomPaymentsData({ reset: true });
  }, []);

  async function onPayBtnClicked(payment: (typeof payments)[0]) {
    await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    var order = await makeApiCall({
      method: "POST",
      url: API_URLS.RZP_CREATE_ORDER,
      body: { payment_split_id: payment.id },
    });

    const rzp1 = new (window as any).Razorpay({
      key: process.env.NEXT_PUBLIC_RZP_KEY,
      amount: payment.amount * 100, // amount in the smallest currency unit,
      name: selectedRoom?.name,
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone,
      },
      order_id: order["rzp_order_id"],
      handler: async (response: any) => {
        var data = await makeApiCall({
          method: "POST",
          url: API_URLS.RZP_CALLBACK,
          body: {
            payment_split_id: payment.id,
            rzp_payment_id: response.razorpay_payment_id,
            rzp_order_id: response.razorpay_order_id,
            rzp_signature: response.razorpay_signature,
          },
        });
        getRoomPaymentsData({ reset: true });
        getRoomFeedData({ reset: true });
        console.log(response);
      },
    });

    // If you want to retreive the chosen payment method.
    rzp1.on("payment.submit", (response: any) => {
      // paymentMethod.current = response.method;
      console.log("Payment success: " + response.method);
    });

    // To get payment id in case of failed transaction.
    rzp1.on("payment.failed", (response: any) => {
      console.log("Payment failed: ");
      // paymentId.current = response.error.metadata.payment_id;
      alert(response.error.description);
    });

    // to open razorpay checkout modal.
    rzp1.open();
  }

  const createRoomPayment = async () => {
    console.log({ paymentName, paymentDescription, paymentAmount });
    if (!paymentName || !paymentDescription || !paymentAmount) return;
    // Logic to create a payment (e.g., API call)
    // After creating, fetch the updated payments
    setIsDialogOpen(false); // Close the dialog
    await createPayment({ name: paymentName, description: paymentDescription, amount: Number(paymentAmount), room_id: selectedRoom!.id });

    setPaymentName(undefined);
    setPaymentDescription(undefined);
    setPaymentAmount(undefined);
  };

  return (
    <div className="max-w-[600px] mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Payments</h2>
        {selectedRoom!.is_admin && (
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            Create Payment
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Payment Name" value={paymentName} onChange={(e) => setPaymentName(e.target.value)} />
            <Input placeholder="Description" value={paymentDescription} onChange={(e) => setPaymentDescription(e.target.value)} />
            <Input placeholder="Amount" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createRoomPayment} className="ml-2">
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {payments.length === 0 && !tab_loading ? (
        <EmptyState message="No payments yet" />
      ) : (
        <InfiniteScroll loading={tab_loading} hasMore={!reached_end} onLoadMore={() => getRoomPaymentsData({ reset: false })}>
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card className="p-4" key={payment.id}>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <IndianRupeeIcon className="w-5 h-5 text-blue-500" />
                      <h3 className="font-medium">{payment.payment.name}</h3>
                      <span className="text-md font-bold text-green-600">₹{payment.amount}</span>
                    </div>
                    <p className="text-sm text-gray-500">{payment.payment.description}</p>
                    {payment.paid_at && <p className="text-sm text-gray-400">{format(new Date(payment.paid_at), "PPp")}</p>}
                  </div>
                  {!payment.paid_at && (
                    <Button variant="secondary" onClick={() => onPayBtnClicked(payment)}>
                      Pay Now
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}

const loadScript = (src: any) =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      console.log("razorpay loaded successfully");
      resolve(true);
    };
    script.onerror = () => {
      console.log("error in loading razorpay");
      resolve(false);
    };
    document.body.appendChild(script);
  });
