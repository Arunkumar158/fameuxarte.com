
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";

const NotFound = () => {
  return (
    <MainLayout>
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mt-4 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </MainLayout>
  );
};

export default NotFound;
