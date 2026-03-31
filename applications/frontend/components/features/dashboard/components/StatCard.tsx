import { Card, CardContent } from "@/components/ui/card";

/**
 * @notice Reusable stat display card component
 * @dev Shows icon, title, and value in a gradient card
 */
export function StatCard({
  title,
  value,
  icon,
}: Readonly<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
}>) {
  return (
    <Card className="bg-gradient-to-br from-[#1a1919] to-[#0f0f0f] border-white/10">
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <p className="text-white text-sm mb-1">{title}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
