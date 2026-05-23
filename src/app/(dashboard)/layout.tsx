import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/ui/Footer";

/**
 * Shared layout for all dashboard routes.
 *
 * Mobile  → column layout: top navbar above the page content
 * Desktop → row layout: left sidebar beside the page content
 *
 * The footer sits at the bottom of the scrollable main area so it's
 * always reachable but never blocks content.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-zinc-50">
      <Sidebar />

      {/* Main content area — scrollable, footer at the bottom */}
      {/* pb-20 on mobile gives clearance above the fixed bottom tab bar */}
      <main className="flex-1 overflow-y-auto flex flex-col pb-20 lg:pb-0">
        <div className="flex-1">
          {children}
        </div>
        <Footer variant="dashboard" />
      </main>
    </div>
  );
}
