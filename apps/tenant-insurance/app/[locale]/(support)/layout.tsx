import { SupportSidebar } from "@/components/support-sidebar";

export default function SupportLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
			<div className="flex gap-6">
				<SupportSidebar />
				<div className="flex-1 py-4">{children}</div>
			</div>
		</div>
	);
}
