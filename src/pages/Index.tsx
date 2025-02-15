
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="p-4 sm:p-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-6">
          <p className="text-[#6D7175] mt-2">
            Transform your product visuals and enhance your brand presence with our suite of AI-powered tools.
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link 
              to="/stylizer" 
              className="group p-4 border rounded-lg hover:border-[#9b87f5] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[#1A1F2C]">Stylizer</h3>
                <ArrowRight className="h-4 w-4 text-[#9b87f5] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-[#6D7175]">
                Transform product photos into professional lifestyle images using AI.
              </p>
            </Link>
            
            <Link 
              to="/expose" 
              className="group p-4 border rounded-lg hover:border-[#9b87f5] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[#1A1F2C]">Expose</h3>
                <ArrowRight className="h-4 w-4 text-[#9b87f5] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-[#6D7175]">
                Create stunning product displays and layouts for your brand.
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
