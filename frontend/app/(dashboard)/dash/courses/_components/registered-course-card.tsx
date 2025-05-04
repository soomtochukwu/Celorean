import { CreditCard } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/lib/types";

export default function RegisteredCoursesCard({ course }: { course: Course }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className=" font-medium text-2xl">{course.name}</CardTitle>
        {/* < className="h-4 w-4 text-muted-foreground" /> */}
      </CardHeader>
      <CardContent>
        <div className=" text-sm ">{course.description}</div>
        <p className="text-xs text-muted-foreground">{course.lecturer}</p>
      </CardContent>
    </Card>
  );
}
