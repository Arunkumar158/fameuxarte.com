
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, ShoppingCart } from "lucide-react";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorType = searchParams.get('type') || 'general';
  const errorMessage = searchParams.get('message') || '';

  const getErrorDetails = () => {
    switch (errorType) {
      case 'cancelled':
        return {
          title: "Payment Cancelled",
          description: "You cancelled the payment process. No charges were made to your account.",
          icon: <XCircle className="w-16 h-16 text-yellow-500" />
        };
      case 'verification_failed':
        return {
          title: "Payment Verification Failed",
          description: "We couldn't verify your payment. Please contact support if you were charged.",
          icon: <XCircle className="w-16 h-16 text-red-500" />
        };
      case 'network_error':
        return {
          title: "Network Error",
          description: "A network error occurred during payment processing. Please check your connection and try again.",
          icon: <RefreshCw className="w-16 h-16 text-blue-500" />
        };
      default:
        return {
          title: "Payment Failed",
          description: errorMessage || "We were unable to process your payment. Please try again or contact support if the problem persists.",
          icon: <XCircle className="w-16 h-16 text-red-500" />
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <MainLayout>
      <div className="container max-w-2xl py-12">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            {errorDetails.icon}
          </div>
          <h1 className="text-2xl font-semibold">{errorDetails.title}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {errorDetails.description}
          </p>
          
          <div className="space-y-4 pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/checkout")}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/cart")}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Return to Cart
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Need help? Contact our support team
              </p>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/contact-us")}
                size="sm"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentFailed;
