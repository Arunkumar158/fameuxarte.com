
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="container max-w-2xl py-12">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-semibold">Ownership Confirmation Unsuccessful</h1>
          <p className="text-muted-foreground">
            We were unable to complete your ownership confirmation. Please try again or contact support if the issue persists.
          </p>
          <div className="space-x-4 pt-4">
            <Button onClick={() => navigate("/checkout")}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate("/cart")}>
              Return to Collection
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentFailed;
