import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
};

export default function MultiBlockCharts({ title, left, right, children }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>{title && <CardTitle>{title}</CardTitle>}</CardHeader>
        <CardContent>{left ?? <div>Left chart</div>}</CardContent>
      </Card>
      <Card>
        <CardHeader />
        <CardContent>{right ?? <div>Right chart</div>}</CardContent>
      </Card>
      {children}
    </div>
  );
}
