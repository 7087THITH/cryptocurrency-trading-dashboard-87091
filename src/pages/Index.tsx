// src/components/MultiBlockCharts.tsx
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  titleLeft?: string;
  titleRight?: string;
  left?: React.ReactNode; // ใส่ chart ซ้าย
  right?: React.ReactNode; // ใส่ chart ขวา
};

export default function MultiBlockCharts({ titleLeft = "Left", titleRight = "Right", left, right }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{titleLeft}</CardTitle>
        </CardHeader>
        <CardContent>{left ?? <div className="h-48">Left chart</div>}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{titleRight}</CardTitle>
        </CardHeader>
        <CardContent>{right ?? <div className="h-48">Right chart</div>}</CardContent>
      </Card>
    </div>
  );
}
