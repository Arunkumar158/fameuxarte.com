
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Clear any lingering order data if needed
  }, []);

  return (
    <MainLayout>
      <div className="container max-w-2xl py-12">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-semibold">Acquisition Confirmed</h1>
          <p className="text-muted-foreground">
            Thank you for your acquisition. Your ownership has been confirmed.
          </p>
          <div className="space-x-4 pt-4">
            <Button onClick={() => navigate("/orders")}>
              View My Acquisitions
            </Button>
            <Button variant="outline" onClick={() => navigate("/artworks")}>
              Continue Exploring
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderSuccess;
