import "../globals.css";
import { ReviewBar } from "@/components/preview/ReviewBar";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <ReviewBar />
    </>
  );
}
