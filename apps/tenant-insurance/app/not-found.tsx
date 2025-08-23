export default function NotFound() {
	return (
		<div className="grid place-items-center py-20 text-center">
			<div className="space-y-3">
				<h1 className="text-3xl font-semibold tracking-tight">
					Page not found
				</h1>
				<p className="text-muted-foreground">
					The page you’re looking for doesn’t exist.
				</p>
			</div>
		</div>
	);
}
