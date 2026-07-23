import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({
    children,
    title,
    subtitle,
    action,
}) {
    return (
        <div className="h-screen w-screen overflow-hidden bg-transparent text-slate-800 dark:text-slate-100 flex">
            {/* Sidebar docked full-height */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <Navbar />
                
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pb-8">
                    <main className="max-w-[1450px] w-full mx-auto py-4 sm:py-6 space-y-6">
                        {/* Page Title & Header row matching Figma */}
                        {(title || subtitle || action) && (
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1 sm:pt-2">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-50 tracking-tight">
                                        {title}
                                    </h2>
                                    {subtitle && (
                                        <p className="text-xs text-slate-400 mt-1">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                {action && <div className="shrink-0">{action}</div>}
                            </div>
                        )}
                        
                        {/* Page Content */}
                        <div>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
