import React from "react";
import { Pie } from "@nivo/pie";

export default function PieChart({ data }) {
    return <Pie data={data} width={400} height={300} margin={{ top: 0, right: 80, bottom: 0, left: 80 }} activeOuterRadiusOffset={8} borderWidth={1} borderColor={{ from: "color", modifiers: [["darker", 0.2]] }} colors={{ scheme: "set2" }} arcLinkLabelsSkipAngle={10} arcLinkLabelsTextColor="#333333" arcLinkLabelsThickness={2} arcLinkLabelsColor={{ from: "color" }} arcLabelsSkipAngle={10} arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }} />;
}
